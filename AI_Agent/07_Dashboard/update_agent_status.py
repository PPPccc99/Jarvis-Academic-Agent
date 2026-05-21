from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path


STATUS_FILE = Path(__file__).with_name("agent_status.json")
VALID_STATUS = {"active", "waiting", "blocked", "done", "idle"}


def now_text() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def normalize_agent_id(value: str) -> str:
    text = str(value).strip()
    return text.zfill(2) if text.isdigit() else text


def load_status() -> dict:
    with STATUS_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_status(data: dict) -> None:
    data["last_updated"] = now_text()
    with STATUS_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def find_agent(data: dict, agent_id: str) -> dict:
    normalized_id = normalize_agent_id(agent_id)
    for agent in data.get("agents", []):
        if normalize_agent_id(agent.get("id", "")) == normalized_id:
            return agent
    raise SystemExit(f"未找到智能体编号：{agent_id}")


def append_event(data: dict, agent_id: str, message: str, event_type: str = "status") -> None:
    data.setdefault("events", []).append(
        {
            "time": now_text(),
            "agent": normalize_agent_id(agent_id),
            "type": event_type,
            "message": message,
        }
    )
    data["events"] = data["events"][-80:]


def reset_agents(data: dict) -> None:
    for agent in data.get("agents", []):
        agent["status"] = "idle"
        agent["current_task"] = ""
        agent["called_by"] = ""
    data["active_chain"] = ["01"]
    data["workflow_stage"] = "等待任务"
    data["summary"] = {
        "current_goal": "等待主控智能体接收任务",
        "next_action": "由用户或主控智能体启动下一阶段",
        "blocking_issue": "",
        "task_folder": "",
    }
    append_event(data, "01", "已重置全部智能体状态。", "system")


def main() -> None:
    parser = argparse.ArgumentParser(description="更新 AI_Agent 可视化仪表盘状态。")
    parser.add_argument("--agent", help="智能体编号，例如 03；也接受 3")
    parser.add_argument("--status", choices=sorted(VALID_STATUS), help="状态：active/waiting/blocked/done/idle")
    parser.add_argument("--task", default=None, help="当前任务说明")
    parser.add_argument("--called-by", default=None, help="调用来源智能体编号")
    parser.add_argument("--stage", default=None, help="当前工作流阶段")
    parser.add_argument("--goal", default=None, help="当前目标")
    parser.add_argument("--next", dest="next_action", default=None, help="下一步动作")
    parser.add_argument("--block", default=None, help="阻塞问题")
    parser.add_argument("--task-folder", default=None, help="本轮贾维斯工作文件夹")
    parser.add_argument("--chain", default=None, help="调用链，例如 01,03,05；也接受 1,3,5")
    parser.add_argument("--event", default=None, help="追加事件说明")
    parser.add_argument("--reset", action="store_true", help="重置全部智能体状态")
    args = parser.parse_args()

    data = load_status()

    if args.reset:
        reset_agents(data)

    if args.agent:
        agent_id = normalize_agent_id(args.agent)
        agent = find_agent(data, agent_id)
        if args.status:
            agent["status"] = args.status
        if args.task is not None:
            agent["current_task"] = args.task
        if args.called_by is not None:
            called_by = str(args.called_by).strip()
            agent["called_by"] = normalize_agent_id(called_by) if called_by else ""
        if args.event:
            append_event(data, agent_id, args.event)
        elif args.status or args.task is not None:
            label = agent.get("name", agent_id)
            append_event(data, agent_id, f"{label} 状态更新为 {agent.get('status')}。")

    if args.stage is not None:
        data["workflow_stage"] = args.stage
    summary = data.setdefault("summary", {})
    if args.goal is not None:
        summary["current_goal"] = args.goal
    if args.next_action is not None:
        summary["next_action"] = args.next_action
    if args.block is not None:
        summary["blocking_issue"] = args.block
    if args.task_folder is not None:
        summary["task_folder"] = args.task_folder
    if args.chain is not None:
        data["active_chain"] = [normalize_agent_id(item) for item in args.chain.split(",") if item.strip()]

    save_status(data)


if __name__ == "__main__":
    main()
