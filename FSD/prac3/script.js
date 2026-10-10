function greet(name) {
  const cleanName = name.trim();
  return `Hello, ${cleanName}! Welcome to JavaScript.`;
}

const student = {
  name: "Maya Sharma",
  course: "Full Stack Development",
  level: "Beginner",
  introduce() {
    return `I am ${this.name} and I am learning ${this.course}.`;
  }
};

let topics = ["Functions", "Objects", "Arrays", "Strings"];

function renderTopics() {
  const topicsList = document.querySelector("#topics-list");
  topicsList.innerHTML = topics
    .map(topic => `<li>${topic}</li>`)
    .join("");

  document.querySelector("#array-count").textContent =
    `${topics.length} topic${topics.length === 1 ? "" : "s"} listed`;
  document.querySelector("#array-result").textContent =
    `Uppercase: ${topics.map(topic => topic.toUpperCase()).join(", ")}`;
}

function updateStringResults() {
  const sentence = document.querySelector("#string-input").value;
  const words = sentence.trim() ? sentence.trim().split(/\s+/) : [];

  document.querySelector("#uppercase-result").textContent = sentence.toUpperCase();
  document.querySelector("#word-count-result").textContent = words.length;
  document.querySelector("#reversed-result").textContent =
    sentence.split("").reverse().join("");
  document.querySelector("#includes-result").textContent =
    sentence.toLowerCase().includes("web") ? "Yes" : "No";
}

document.querySelector("#greeting-form").addEventListener("submit", event => {
  event.preventDefault();
  const nameInput = document.querySelector("#visitor-name");
  document.querySelector("#greeting-output").textContent = greet(nameInput.value);
});

document.querySelector("#profile-name").textContent = student.name;
document.querySelector("#profile-details").textContent =
  `${student.course} · ${student.level}`;
document.querySelector("#profile-introduction").textContent = student.introduce();

document.querySelector("#add-item").addEventListener("click", () => {
  const itemInput = document.querySelector("#item-input");
  const item = itemInput.value.trim();

  if (!item) {
    itemInput.focus();
    return;
  }

  topics.push(item);
  itemInput.value = "";
  renderTopics();
  itemInput.focus();
});

document.querySelector("#item-input").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    document.querySelector("#add-item").click();
  }
});

document.querySelector("#string-input").addEventListener("input", updateStringResults);

renderTopics();
updateStringResults();
