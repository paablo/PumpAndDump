const Deck = require("./Deck");

class Room {
	constructor(name) {
		this.name = name;
		this.names = [];
		this.start = false;
		this.roundNumber = 1;
		this.playerCash = {};
		this.deck = null;
		this.opencard = null;
		this._turn = 0;
		this.handValues = {};
	}

	addPlayer(name) {
		if (!this.names.includes(name)) this.names.push(name);
		if (this.playerCash[name] === undefined) this.playerCash[name] = 30;
	}

	removePlayer(name) {
		const idx = this.names.indexOf(name);
		if (idx !== -1) this.names.splice(idx, 1);
		if (this.playerCash && this.playerCash[name] !== undefined) {
			delete this.playerCash[name];
		}
	}

	startGame(io) {
		this.start = true;
		this.deck = new Deck();
		if (this.deck.length() < 7) {
			this.deck.reset();
			this.deck.shuffle();
		}
		this.opencard = this.deck.deal();

		const roomSet = io.sockets.adapter.rooms.get(this.name);
		if (!roomSet) return;

		for (const playerSocketId of roomSet) {
			const card1 = this.deck.deal();
			const card2 = this.deck.deal();
			const card3 = this.deck.deal();
			const card4 = this.deck.deal();
			const cards = [card1, card2, card3, card4];
			const playerNames = this.names;
			const socket = io.sockets.sockets.get(playerSocketId);
			const playerName = socket.nickname;
			const playerCash =
				this.playerCash && this.playerCash[playerName] !== undefined
					? this.playerCash[playerName]
					: 30;
			io.to(playerSocketId).emit("start_variables", {
				opencard: this.opencard,
				cards,
				playerNames,
				playerCash,
			});
		}
		io.in(this.name).emit("cash_update", this.playerCash);

		this._turn = 0;
		const current_room = Array.from(roomSet);
		io.in(this.name).emit(
			"your_turn",
			io.sockets.sockets.get(current_room[0]).nickname
		);
	}

	endGame(io, enderName) {
		this.start = false;
		io.in(this.name).emit("end_game", `${enderName} has ended the game`);
		// cleanup (if needed) is left to the caller that manages Room instances
	}

	pickCardForSocket(socketId, pickedOption, io) {
		if (pickedOption === "deck") {
			io.to(socketId).emit("picked_card", this.deck.deal());
		} else {
			io.to(socketId).emit("picked_card", this.opencard);
		}
	}

	advanceTurn(io) {
		const roomSet = io.sockets.adapter.rooms.get(this.name);
		if (!roomSet || roomSet.size === 0) return;
		this._turn = (this._turn + 1) % roomSet.size;
		const current_room = Array.from(roomSet);
		io.in(this.name).emit(
			"your_turn",
			io.sockets.sockets.get(current_room[this._turn]).nickname
		);
	}

	updateHandValue(playerName, value) {
		this.handValues[playerName] = value;
	}

	handleDeclare(declarerName, io) {
		let caught = false;
		const declarerValue = this.handValues[declarerName];
		for (const [name, value] of Object.entries(this.handValues)) {
			if (name === declarerName) continue;
			if (value <= declarerValue) {
				caught = true;
				break;
			}
		}

		// broadcast results
		if (caught) {
			io.to(this.name).emit(
				"declare_result",
				`${declarerName} has declared and has been caught`
			);
			for (const [id, socketObj] of io.sockets.sockets) {
				if (socketObj.nickname === declarerName) {
					io.to(id).emit(
						"declare_result",
						`your have declared and have been caught`
					);
					break;
				}
			}
		} else {
			io.to(this.name).emit(
				"declare_result",
				`${declarerName} has declared and has won this round`
			);
			for (const [id, socketObj] of io.sockets.sockets) {
				if (socketObj.nickname === declarerName) {
					io.to(id).emit(
						"declare_result",
						`your have declared and have won this round`
					);
					break;
				}
			}
		}

		this.roundNumber++;
		io.in(this.name).emit("round_update", this.roundNumber);
	}
}

module.exports = Room;
