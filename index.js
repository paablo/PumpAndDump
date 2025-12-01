const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").createServer(app);
const ws = require("ws");
const path = require("path");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
	wsEngine: ws.Server,
});

const Room = require("./Room");

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
	app.use(express.static("frontend/build"));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "build", "index.html"));
	});
}

server.listen(PORT, () => {
	console.log(`server started on Port ${PORT}`);
});

// rooms map replaces the previous 'sockets' object
const rooms = {};

io.on("connection", (socket) => {
	console.log(`user ${socket.id} has connected`);
	io.to(socket.id).emit("server_id", socket.id);

	socket.on("join_room", ({ room, name }) => {
		try {
			socket.join(room);
			socket.nickname = name;
			socket.room = room;

			if (!rooms[room]) {
				rooms[room] = new Room(room);
			}
			rooms[room].addPlayer(name);

			io.in(room).emit(
				"player_count",
				io.sockets.adapter.rooms.get(room).size
			);
			io.in(room).emit("update", `${name} has joined room ${room}`);
			io.in(room).emit("cash_update", rooms[room].playerCash);
			console.log(`${name} joined room ${room}`);
		} catch (err) {
			console.log(err.message);
		}
	});

	socket.on("leave_room", ({ name, room }) => {
		try {
			socket.leave(room);
			delete socket.room;
			delete socket.nickname;
			const r = rooms[room];
			if (r) {
				io.in(room).emit("update", `${name} has left room ${room}`);
				const roomSet = io.sockets.adapter.rooms.get(room);
				io.in(room).emit(
					"player_count",
					roomSet ? roomSet.size : 0
				);
				r.removePlayer(name);
				io.in(room).emit("cash_update", r.playerCash);
				console.log(`${name} has left ${room}`);
			}
		} catch (error) {
			console.log(error.message);
		}
	});

	socket.on("update", ({ update, room }) => {
		try {
			io.in(room).emit("update", update);
		} catch (error) {
			console.log(error.message);
		}
	});

	let current_room;

	socket.on("start_game", (room) => {
		try {
			console.log("Game started");
			io.in(room).emit("start_game");
			if (!rooms[room]) rooms[room] = new Room(room);
			rooms[room].startGame(io);
		} catch (error) {
			console.log(error.message);
		}
	});

	socket.on("end_game", (room) => {
		try {
			console.log("game ended");
			const r = rooms[room];
			if (r) {
				r.endGame(io, socket.nickname);
				delete rooms[room];
			} else {
				io.in(room).emit("end_game", `${socket.nickname} has ended the game!`);
			}
		} catch (error) {
			console.log(error.message);
		}
	});

	socket.on("turn_over", ({ room }) => {
		try {
			const r = rooms[room];
			if (!r) return;
			// Simply advance to next player's turn
			r.advanceTurn(io);
		} catch (error) {
			console.log(error.message);
		}
	});

	socket.on("purchase_stock", ({ room, playerName, stock }) => {
		try {
			const r = rooms[room];
			if (!r) {
				socket.emit("purchase_result", { 
					success: false, 
					message: "Room not found" 
				});
				return;
			}

			const result = r.purchaseStock(playerName, stock);
			
			// Send result to requesting player
			socket.emit("purchase_result", result);

			// If successful, broadcast cash and portfolio updates to all players
			if (result.success) {
				io.in(room).emit("cash_update", r.playerCash);
				io.in(room).emit("portfolio_update", {
					playerName: playerName,
					ownedStocks: result.ownedStocks
				});
				io.in(room).emit("game_log_update", r.logger.getRecentLog(10));
				io.in(room).emit("stock_ownership_update", r.getStockOwnershipCounts());
				io.in(room).emit("actions_update", {
					playerName: playerName,
					actionsRemaining: result.actionsRemaining
				});
				io.in(room).emit("net_worth_update", r.getAllPlayerNetWorths());
			}
		} catch (error) {
			console.log(error.message);
			socket.emit("purchase_result", { 
				success: false, 
				message: "Purchase failed: " + error.message 
			});
		}
	});

	socket.on("sell_stock", ({ room, playerName, stock }) => {
		try {
			const r = rooms[room];
			if (!r) {
				socket.emit("sell_result", { 
					success: false, 
					message: "Room not found" 
				});
				return;
			}

			const result = r.sellStock(playerName, stock);
			
			// Send result to requesting player
			socket.emit("sell_result", result);

			// If successful, broadcast cash and portfolio updates to all players
			if (result.success) {
				io.in(room).emit("cash_update", r.playerCash);
				io.in(room).emit("portfolio_update", {
					playerName: playerName,
					ownedStocks: result.ownedStocks
				});
				io.in(room).emit("game_log_update", r.logger.getRecentLog(10));
				io.in(room).emit("stock_ownership_update", r.getStockOwnershipCounts());
				io.in(room).emit("actions_update", {
					playerName: playerName,
					actionsRemaining: result.actionsRemaining
				});
				io.in(room).emit("net_worth_update", r.getAllPlayerNetWorths());
			}
		} catch (error) {
			console.log(error.message);
			socket.emit("sell_result", { 
				success: false, 
				message: "Sale failed: " + error.message 
			});
		}
	});

	socket.on("disconnect", () => {
		try {
			console.log(`${socket.id} has disconnected`);
			if (!socket.room) {
				return;
			}
			const r = rooms[socket.room];
			if (!r) return;

			if (r.start) {
				io.in(socket.room).emit("end_game", `${socket.nickname} has left the game`);
				delete rooms[socket.room];
			} else {
				const roomSet = io.sockets.adapter.rooms.get(socket.room);
				io.in(socket.room).emit(
					"player_count",
					roomSet ? roomSet.size : 0
				);
				r.removePlayer(socket.nickname);
				io.in(socket.room).emit("cash_update", r.playerCash);
				io.emit("update", `${socket.nickname} has left`);
			}
		} catch (error) {
			console.log(error.message);
		}
	});
});
