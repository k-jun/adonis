export class Room {
  constructor(level) {
    this.users = [];
    this.cards = [];
    this.level = "basic";
  }

  join(socket) {
    this.users.push({
      id: socket.id,
      name: "",
      isMaster: false,
      socket: socket,
    });
  }

  leave(socket) {
    let idx = -1;
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id == socket.id) {
        idx = i;
      }
    }
    if (idx != -1) {
      this.users.splice(idx, 1);
    }
  }

  refresh() {
    for (let i = 0; i < this.users.length; i++) {
      const payload = {
        cards: this.cards,
        users: this.users.map((x) => ({
          id: x.id,
          name: x.name,
          isMaster: x.isMaster,
        })),
        level: this.level,
      };
      this.users[i].socket.emit("refresh", payload);
    }
  }

  rename(socket, name) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id == socket.id) {
        this.users[i].name = name;
      }
    }
  }

  switch(socket) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id == socket.id) {
        this.users[i].isMaster = !this.users[i].isMaster;
      }
    }
  }

  flip(cardid) {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].id == cardid) {
        this.cards[i].isOpen = true;
      }
    }
  }

  setLevel(level) {
    if (
      level != "basic" &&
      level != "advance" &&
      level != "master" &&
      level != "debug"
    ) {
      level = "basic";
    }
    this.level = level;
  }

  async GameStart() {
    this.cards = [];

    const text = await Deno.readTextFile(`./src/deck/${this.level}.txt`);
    var deck = text.toString().split("\n");
    const idxes = [];
    while (idxes.length < 25) {
      const idx = Math.floor(Math.random() * deck.length);
      if (idxes.indexOf(idx) == -1) {
        idxes.push(idx);
      }
    }

    const agents = [];

    while (agents.length < 9 + 8 + 1) {
      const idx = Math.floor(Math.random() * 25);
      if (agents.indexOf(idx) == -1) {
        agents.push(idx);
      }
    }
    const redAgents = agents.slice(0, 9);
    const blueAgents = agents.slice(9, 17);
    const assassin = agents[17];

    for (let i = 0; i < idxes.length; i++) {
      this.cards.push({
        id: idxes[i] + 1,
        name: deck[idxes[i]],
        isOpen: false,
        color: "#ffff7f",
      });
    }

    for (let i = 0; i < redAgents.length; i++) {
      this.cards[redAgents[i]].color = "#ff7f7f";
    }
    for (let i = 0; i < blueAgents.length; i++) {
      this.cards[blueAgents[i]].color = "#7f7fff";
    }
    this.cards[assassin].color = "#000";
  }
}
