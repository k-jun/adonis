import { h, text, app } from "https://unpkg.com/hyperapp";
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

let path = "/socket.io"
if (window.location.pathname !== '/') {
  path = `${window.location.pathname}socket.io"`
}
const socket = io(window.location.origin, { path });

const onFlip = (state, payload) => {
  console.log(payload);
  socket.emit("flip", payload);
  return { ...state };
};

const Card = (card = {}, users = []) => {
  const isOpen = users.find((u) => u.id == socket.id)?.isMaster || card.isOpen;

  return h(
    "div",
    {
      style: {
        height: "130px",
        width: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        fontFamily: "Shinonome14B",
        backgroundColor: isOpen ? card.color : "#ddd",
        color: isOpen && card.color == "#000" ? "red" : "black",
      },
      onclick: [onFlip, card.id],
    },
    text(card.name)
  );
};

const CardRow = (cards = [], users = []) => {
  const view = [];
  for (let i = 0; i < cards.length; i++) {
    view.push(Card(cards[i], users));
  }
  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
      },
    },
    view
  );
};

const onChange = (state, event) => {
  socket.emit("rename", event.target.value);
  return { ...state, username: event.target.value };
};

const onSwitch = (state) => {
  socket.emit("switch", {});
  return { ...state };
};

const onReset = (state) => {
  socket.emit("reset");
  return { ...state };
};

const Board = (cards, users) => {
  const view = [];
  for (let i = 0; i < cards.length / 5; i++) {
    const j = Math.min(5, cards.length - i * 5);
    view.push(CardRow(cards.slice(i * 5, i * 5 + j), users));
  }
  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        padding: "20px",
        height: "800px",
      },
    },
    view
  );
};
const setLevel = (state, payload) => {
  socket.emit("level", payload);
  return { ...state };
};

const dispatch = app({
  init: { username: "", level: "", users: [], cards: [] },
  view: ({ username, users, cards, level }) =>
    h("main", {}, [
      h("h1", {}, text("コードネーム")),
      h("div", { display: "flex", flexDirection: "row" }, [
        text(`codename:`),
        h("input", {
          type: "text",
          onchange: onChange,
          placeholder: "enter codename",
          value: username,
          style: { backgroundColor: "#ddd", margin: "0 5px" },
        }),
        h(
          "button",
          { onclick: onSwitch },
          text(
            `switch to ${users.find((u) => u.id == socket.id)?.isMaster
              ? "teammate"
              : "spymaster"
            }`
          )
        ),
        h("button", { onclick: [onReset, level] }, text("reset")),
        h("input", {
          type: "radio",
          name: "level",
          checked: level == "basic",
          onchange: [setLevel, "basic"],
        }),
        text("basic"),
        h("input", {
          type: "radio",
          name: "level",
          value: "advance",
          checked: level == "advance",
          onchange: [setLevel, "advance"],
        }),
        text("advance"),
        h("input", {
          type: "radio",
          name: "level",
          value: "master",
          checked: level == "master",
          onchange: [setLevel, "master"],
        }),
        text("master"),
      ]),
      h("div", { display: "flex", flexDirection: "row" }, [
        text(
          `teammates: ${users
            .filter((u) => !u.isMaster)
            .map((u) => u.name)
            .join(", ")} `
        ),
        text(
          `spymasters: ${users
            .filter((u) => u.isMaster)
            .map((u) => u.name)
            .join(",")} `
        ),
      ]),

      username && Board(cards, users),
    ]),
  node: document.getElementById("app"),
});

const Refresh = (state, payload) => {
  return { ...state, ...payload };
};

socket.on("refresh", (payload) => {
  dispatch(Refresh, payload);
});
