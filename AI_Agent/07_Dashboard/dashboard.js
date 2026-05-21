const statusLabels = {
  active: "工作中",
  waiting: "等待",
  blocked: "阻塞",
  done: "完成",
  idle: "空闲"
};

const agentVisuals = {
  "01": { mark: "MC", shape: "round", color: "#0f766e", soft: "#ccfbf1" },
  "02": { mark: "FX", shape: "square", color: "#2563eb", soft: "#dbeafe" },
  "03": { mark: "HJ", shape: "hex", color: "#b45309", soft: "#fef3c7" },
  "04": { mark: "RF", shape: "diamond", color: "#7c3aed", soft: "#ede9fe" },
  "05": { mark: "DB", shape: "shield", color: "#15803d", soft: "#dcfce7" },
  "06": { mark: "IN", shape: "tag", color: "#be123c", soft: "#ffe4e6" },
  "07": { mark: "TB", shape: "capsule", color: "#0e7490", soft: "#cffafe" },
  "08": { mark: "WR", shape: "leaf", color: "#c2410c", soft: "#ffedd5" },
  "09": { mark: "SE", shape: "bolt", color: "#9333ea", soft: "#f3e8ff" },
  "10": { mark: "QC", shape: "bevel", color: "#0369a1", soft: "#e0f2fe" },
  "11": { mark: "RA", shape: "drop", color: "#a16207", soft: "#fef9c3" },
  "12": { mark: "FT", shape: "panel", color: "#0891b2", soft: "#ecfeff" },
  "13": { mark: "LG", shape: "ribbon", color: "#4f46e5", soft: "#e0e7ff" },
  "14": { mark: "SB", shape: "seal", color: "#475569", soft: "#f1f5f9" },
  "15": { mark: "RV", shape: "oct", color: "#b91c1c", soft: "#fee2e2" }
};

let state = null;
let currentFilter = "all";
let searchText = "";

const fallbackState = {
  dashboard_name: "贾维斯论文写作智能体工作台",
  last_updated: "未加载",
  workflow_stage: "离线模式",
  active_chain: ["01"],
  summary: {
    current_goal: "未能读取 agent_status.json",
    next_action: "请通过本地服务器打开本页面",
    blocking_issue: "file:// 方式可能阻止读取 JSON",
    task_folder: ""
  },
  agents: [],
  events: []
};

async function loadStatus() {
  try {
    const response = await fetch(`./agent_status.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    state = await response.json();
  } catch (error) {
    state = { ...fallbackState, load_error: String(error) };
  }
  render();
}

function normalizeAgentId(id) {
  const raw = String(id || "").trim();
  return /^\d+$/.test(raw) ? raw.padStart(2, "0") : raw;
}

function agentById(id) {
  const normalized = normalizeAgentId(id);
  return (state.agents || []).find((agent) => normalizeAgentId(agent.id) === normalized);
}

function visualFor(agent) {
  const normalized = normalizeAgentId(agent.id);
  return agentVisuals[normalized] || { mark: normalized, shape: "round", color: "#667085", soft: "#eef2f6" };
}

function isWorkingAgent(agent) {
  const chain = (state.active_chain || []).map(normalizeAgentId);
  return agent.status === "active" || chain.includes(normalizeAgentId(agent.id));
}

function mascotMarkup(agent, sizeClass = "") {
  const visual = visualFor(agent);
  return `
    <span class="pet ${sizeClass} shape-${visual.shape}" style="--pet:${visual.color}; --pet-soft:${visual.soft}">
      <span class="pet-antenna"></span>
      <span class="pet-mark">${visual.mark}</span>
    </span>
  `;
}

function render() {
  renderHeader();
  renderMetrics();
  renderMascots();
  renderChain();
  renderSummary();
  renderEvents();
  renderAgents();
}

function renderHeader() {
  document.getElementById("lastUpdated").textContent = `更新：${state.last_updated || "未知"}`;
  document.getElementById("workflowStage").textContent = state.workflow_stage || "未开始";
}

function renderMetrics() {
  const counts = { active: 0, waiting: 0, blocked: 0, done: 0, idle: 0 };
  for (const agent of state.agents || []) {
    counts[agent.status] = (counts[agent.status] || 0) + 1;
  }
  document.getElementById("countActive").textContent = counts.active || 0;
  document.getElementById("countWaiting").textContent = counts.waiting || 0;
  document.getElementById("countBlocked").textContent = counts.blocked || 0;
  document.getElementById("countDone").textContent = counts.done || 0;
  document.getElementById("countIdle").textContent = counts.idle || 0;
}

function renderMascots() {
  const deck = document.getElementById("mascotDeck");
  const count = document.getElementById("mascotCount");
  if (!deck) return;

  const agents = state.agents || [];
  if (count) {
    count.textContent = `${agents.length} 个智能体`;
  }
  deck.innerHTML = "";

  for (const agent of agents) {
    const working = isWorkingAgent(agent);
    const visual = visualFor(agent);
    const card = document.createElement("article");
    card.className = `mascot-card ${working ? "is-working" : ""} status-${agent.status || "idle"}`;
    card.style.setProperty("--pet", visual.color);
    card.style.setProperty("--pet-soft", visual.soft);
    card.innerHTML = `
      ${mascotMarkup(agent, "pet-small")}
      <div class="mascot-copy">
        <strong>${agent.id} ${agent.name}${working ? "<span>（努力工作中）</span>" : ""}</strong>
        <p>${agent.current_task || agent.group || "空闲"}</p>
      </div>
    `;
    deck.appendChild(card);
  }
}

function renderChain() {
  const chain = document.getElementById("callChain");
  chain.innerHTML = "";
  const ids = (state.active_chain && state.active_chain.length ? state.active_chain : ["01"]).map(normalizeAgentId);
  ids.forEach((id, index) => {
    const agent = agentById(id);
    const node = document.createElement("div");
    node.className = "chain-node";
    node.innerHTML = agent
      ? `${mascotMarkup(agent, "pet-chain")}<span>${normalizeAgentId(agent.id)} ${agent.name}</span>`
      : `<span class="dot idle"></span><span>${id} 未知智能体</span>`;
    chain.appendChild(node);
    if (index < ids.length - 1) {
      const arrow = document.createElement("span");
      arrow.className = "chain-arrow";
      arrow.textContent = "->";
      chain.appendChild(arrow);
    }
  });
}

function renderSummary() {
  const summary = state.summary || {};
  document.getElementById("currentGoal").textContent = summary.current_goal || "未设置";
  document.getElementById("nextAction").textContent = summary.next_action || "未设置";
  document.getElementById("blockingIssue").textContent = summary.blocking_issue || "无";
  document.getElementById("taskFolder").textContent = summary.task_folder || "未创建";
}

function renderEvents() {
  const list = document.getElementById("eventList");
  list.innerHTML = "";
  const events = (state.events || []).slice(-8).reverse();
  if (!events.length) {
    const item = document.createElement("li");
    item.textContent = "暂无事件";
    list.appendChild(item);
    return;
  }
  for (const event of events) {
    const agent = agentById(event.agent);
    const item = document.createElement("li");
    item.innerHTML = `<strong>${event.time || ""} ${agent ? agent.name : event.agent || ""}</strong>${event.message || ""}`;
    list.appendChild(item);
  }
}

function renderAgents() {
  const grid = document.getElementById("agentGrid");
  grid.innerHTML = "";
  const agents = (state.agents || []).filter((agent) => {
    const groupMatch = currentFilter === "all" || agent.group === currentFilter;
    const text = `${agent.id} ${agent.name} ${agent.group} ${agent.role} ${agent.current_task}`.toLowerCase();
    const searchMatch = !searchText || text.includes(searchText.toLowerCase());
    return groupMatch && searchMatch;
  });

  if (!agents.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "没有匹配的智能体。";
    grid.appendChild(empty);
    return;
  }

  for (const agent of agents) {
    const card = document.createElement("article");
    card.className = `agent status-${agent.status || "idle"}`;
    card.innerHTML = `
      <div class="agent-top">
        ${mascotMarkup(agent)}
        <div class="agent-title">
          <h3>${agent.name}</h3>
          <p>${agent.group}</p>
        </div>
        <span class="status-pill"><span class="dot ${agent.status || "idle"}"></span>${statusLabels[agent.status] || "未知"}</span>
      </div>
      <p class="role">${agent.role || ""}</p>
      <dl>
        <dt>当前任务</dt>
        <dd>${agent.current_task || "无"}</dd>
        <dt>调用来源</dt>
        <dd>${agent.called_by || "无"}</dd>
        <dt>输出目录</dt>
        <dd>${agent.output || "未设置"}</dd>
      </dl>
    `;
    grid.appendChild(card);
  }
}

document.getElementById("refreshBtn").addEventListener("click", loadStatus);
document.getElementById("searchInput").addEventListener("input", (event) => {
  searchText = event.target.value.trim();
  renderAgents();
});
document.getElementById("filters").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  currentFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach((item) => item.classList.toggle("is-active", item === button));
  renderAgents();
});

loadStatus();
setInterval(loadStatus, 5000);
