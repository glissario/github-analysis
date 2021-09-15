const nickname = document.querySelector("#get-nick");
let repoInfos = [];
let issueInfos = [];
let allIssues = [];

const canvas = document.getElementById("issues_diagramm");
const canvasWidth = 1200;
const canvasHeight = 400;

class Issue {
  constructor(name, status, duration) {
    this.name = name;
    this.status = status;
    this.duration = duration;
  }
}

nickname.addEventListener("keydown", function (e) {
  if (e.keyCode === 13) {
    if (repoInfos.length > null) {
      //canvas = document.getElementById("issues_diagramm");
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      repoInfos = [];
      issueInfos = [];
      allIssues = [];
      const repos = document.querySelector("#repos").firstChild;
      repos.remove();
      const issues = document.querySelector("#issues").firstChild;
      issues.remove();
      const outputIssues = document.querySelector("#openIssues").firstChild;
      outputIssues.remove();
    }
    getRepos();
  }
});

function getRepos() {
  const link = "https://api.github.com/users/" + event.target.value + "/repos";
  const nick = event.target.value;
  console.log(link);

  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  fetch(link, requestOptions)
    .then((response) => response.text())
    .then(function (result) {
      repoInfos = JSON.parse(result);
      countRepos();
      issues(nick);
    })
    .catch((error) => console.log("error", error));
}

function countRepos() {
  const outputRepo = document.querySelector("#repos");
  const RepoNode = document.createTextNode(repoInfos.length);
  outputRepo.appendChild(RepoNode);
}

function issues(nickname) {
  const link =
    "https://api.github.com/repos/" +
    nickname +
    "/bootcamp-schedule/issues?state=all&per_page=100";

  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  fetch(link, requestOptions)
    .then((response) => response.text())
    .then(function (result) {
      issueInfos = JSON.parse(result);
      countIssues();
      openIssues();
      longestIssue();
    })
    .catch((error) => console.log("error", error));
}

function countIssues() {
  const outputIssues = document.querySelector("#issues");
  const issueNode = document.createTextNode(issueInfos.length);
  outputIssues.appendChild(issueNode);
}

function openIssues() {
  let countOpenIssues = 0;
  for (let i = 0; i < issueInfos.length; i++) {
    if (issueInfos[i].state === "open") {
      countOpenIssues++;
    }
  }
  const outputIssues = document.querySelector("#openIssues");
  const issueNode = document.createTextNode(countOpenIssues);
  outputIssues.appendChild(issueNode);
}

function longestIssue() {
  const date = new Date();
  let maxduration = 0;
  for (let i = 0; i < issueInfos.length; i++) {
    if (issueInfos[i].state === "open") {
      const date2 = new Date(issueInfos[i].created_at);
      //console.log(date2);
      let diff = date - date2;
      const diffDay = Math.floor(diff / (1000 * 60 * 60 * 24));
      const diffHour = Math.floor(diff / (1000 * 60 * 60));
      console.log("day:" + diffDay + "hour:" + (diffHour % 24));
      if (maxduration < diffHour) {
        maxduration = diffHour;
      }
      const issue = new Issue(issueInfos[i].title, "open", diffHour);
      allIssues.push(issue);
    } else {
      const dateOpen = new Date(issueInfos[i].created_at);
      const dateClose = new Date(issueInfos[i].closed_at);
      let diff = dateClose - dateOpen;
      const diffDay = Math.floor(diff / (1000 * 60 * 60 * 24));
      const diffHour = Math.floor(diff / (1000 * 60 * 60));
      const issue = new Issue(issueInfos[i].title, "close", diffHour);
      allIssues.push(issue);
    }
  }
  console.log("max:" + maxduration);
  createDiagram(maxduration);
}

function createDiagram(y) {
  var cv = canvas.getContext("2d");
  cv.clearRect(0, 0, canvasWidth, canvasHeight);
  //Options Grid
  var graphGridSize = 50;
  var graphGridX = (canvasWidth / graphGridSize).toFixed();
  //Draw Grid
  for (var i = 0; i < graphGridX; i++) {
    cv.moveTo(canvasWidth, graphGridSize * i);
    cv.lineTo(0, graphGridSize * i);
    cv.fillText(
      Math.floor((canvasHeight - graphGridSize * i) * (y / canvasHeight)) + "h",
      5,
      i * 50 - 3
    );
  }
  cv.strokeStyle = "#dbdbdb";
  cv.stroke();

  //Options Graph
  var graphMax = y;
  var graphPadding = 2;
  var graphFaktor = (canvasHeight - 5 * graphPadding) / graphMax;
  console.log(graphFaktor);
  var graphWidth = (canvasWidth - 2 * graphPadding) / (allIssues.length + 1);
  console.log(graphWidth);
  var graphTextcolor = "white";

  //Draw Graph
  for (var i = allIssues.length - 1; i >= 0; i--) {
    tmpTop =
      (canvasHeight - graphFaktor * allIssues[i].duration).toFixed() -
      graphPadding;
    tmpHeight = (allIssues[i].duration * graphFaktor).toFixed();
    if (allIssues[i].status === "open") {
      cv.fillStyle = "#E65858";
    } else {
      cv.fillStyle = "green";
    }

    cv.fillRect(
      graphWidth + (allIssues.length - i - 1) * graphWidth + graphPadding,
      tmpTop,
      graphWidth - graphPadding,
      tmpHeight
    );
    cv.fillStyle = graphTextcolor;

    if (allIssues[i].status === "open" || allIssues[i].duration > 72) {
      cv.fillText(
        allIssues.length - i,
        graphWidth + (allIssues.length - i - 1) * graphWidth + graphPadding,
        canvasHeight - 2,
        graphWidth
      );
    }
  }
}
