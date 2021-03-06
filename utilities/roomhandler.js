const Room = require("../classes/room");
const Player = require("../classes/player");
const logger = require("./logger");

class RoomHandler {
    constructor() {
        this.rooms = {}; //Dictionary: room id -> room object
        this.idToPlayer = {}; //Dictionary: Socket id -> player object
    }

    getPlayer(playerID) {
        if(!this.checkPlayerExists(playerID))
            throw new Error("Player was not found in ID list")
        return this.idToPlayer[playerID];
    }

    getNicknameList(roomID){
        if(!this.checkRoomExists(roomID))
            throw new Error("Room was not found in room list")
        return this.rooms[roomID].players.map(p => p.nickname);
    }

    getPlayerIDList(roomID){
        if(!this.checkRoomExists(roomID))
            throw new Error("Room was not found in room list")
        return this.rooms[roomID].players.map(p => p.id);
    }

    getLeaderID(roomID){
        if(!this.checkRoomExists(roomID))
            throw new Error("Room was not found in room list")
        return this.rooms[roomID].leader.id;
    }

    checkPlayerExists(playerID) {
        return playerID in this.idToPlayer;
    }

    checkRoomExists(roomID) {
        return roomID in this.rooms;
    }

    checkPlayerHasRoom(playerID) {
        if(!this.checkPlayerExists(playerID))
            throw new Error("Room was not found in room list")
        return this.getPlayer(playerID).room != null;
    }

    getRoomIDOfPlayer(playerID) {
        if(!this.checkPlayerExists(playerID))
            throw new Error("Player was not found in ID list")
        
        if(!this.checkPlayerHasRoom(playerID))
            throw new Error("Player did not have associated room")

        return this.getPlayer(playerID).room.id
    }

    disconnectPlayer(playerID) {
        if(!this.checkPlayerExists(playerID))
            throw new Error("Player was not found in ID list")

        this.getPlayer(playerID).disconnect();
        delete this.idToPlayer[playerID]
    }

    deleteRoomIfEmpty(roomID) {
        if(!this.checkRoomExists(roomID))
            throw new Error("Room was not found in room list")
        
        if (this.rooms[roomID].players.length == 0) {
            delete this.rooms[roomID]
            return true;
        }
        return false;
    }

    createRoomIfNotExist(roomID) {
        if (!this.checkRoomExists(roomID)) {
            this.rooms[roomID] = new Room(roomID);
            return true;
        }
        return false;
    }

    createPlayer(id, nickname, roomID, socket) {
        if (roomID == "") {
            return;
        }
        this.createRoomIfNotExist(roomID)
        const player = new Player(id, nickname, this.rooms[roomID], socket);
        this.idToPlayer[id] = player;
        this.addPlayerToRoom(id, roomID)
    }

    addPlayerToRoom(playerID, roomID) {//probably not needed since player already assigned to room from the start
        if(!this.checkPlayerExists(playerID))
            throw new Error("Player was not found in player list")
        if(!this.checkRoomExists(roomID))
            throw new Error("Room was not found in room list")
        this.rooms[roomID].addPlayer(this.idToPlayer[playerID]);
    }

    getGameOfRoomID(roomID) {
        if(!this.checkRoomExists(roomID))
            throw new Error("Room was not found in room list")
        return this.rooms[roomID].getSelectedGame();
    }

    setGameOfRoomID(roomID, selectedGame) {
        if(!this.checkRoomExists(roomID))
            throw new Error("Room was not found in room list")
        this.rooms[roomID].setSelectedGame(selectedGame);
    }

    startGameInRoom(roomID, io) {
        this.rooms[roomID].startGame(io);
    }

    getStatusOfRoomID(roomID) {
        if(!this.checkRoomExists(roomID))
            throw new Error("Room was not found in room list")
        return this.rooms[roomID].getStatus()
    }
}

module.exports = RoomHandler