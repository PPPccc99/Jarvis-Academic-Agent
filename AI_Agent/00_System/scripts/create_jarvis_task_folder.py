from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path


DEFAULT_PROJECT_ROOT = Path(r"{{PROJECT_ROOT}}")
FOLDER_SUFFIX = "_贾维斯智能体工作任务"
SUBDIRS = [
    "00_启动信息",
    "01_任务记录",
    "02_输入材料索引",
    "03_目标期刊拆解",
    "04_参考文献拆解",
    "05_证据库",
    "06_选题与创新点",
    "07_论文任务书",
    "08_正文草稿",
    "09_仿真与实验计划",
    "10_结果分析",
    "11_图表",
    "12_润色与投稿检查",
    "13_审稿意见",
    "99_临时文件",
]


def today_prefix() -> str:
    now = datetime.now()
    return f"{now.year}.{now.month}.{now.day}"


def next_folder(root: Path, prefix: str) -> Path:
    index = 1
    while True:
        candidate = root / f"{prefix}（{index}）{FOLDER_SUFFIX}"
        if not candidate.exists():
            return candidate
        index += 1


def create_folder(root: Path) -> Path:
    root.mkdir(parents=True, exist_ok=True)
    folder = next_folder(root, today_prefix())
    folder.mkdir()
    for subdir in SUBDIRS:
        (folder / subdir).mkdir()

    meta = {
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "project_root": str(root),
        "task_folder": str(folder),
        "rule": "All files generated in this Jarvis conversation should be saved under this folder unless the user explicitly requests otherwise.",
    }
    (folder / "00_启动信息" / "jarvis_task_folder.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (folder / "README.md").write_text(
        "# 贾维斯智能体工作任务\n\n"
        "本文件夹用于保存本次召唤贾维斯后，在当前对话中产生的任务记录、拆解结果、草稿、审稿意见、图表建议和临时文件。\n\n"
        "除非用户明确指定其他位置，本轮所有新生成文件都应放在本文件夹或其子目录中。\n",
        encoding="utf-8",
    )
    return folder


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a dated Jarvis task folder under the project root.")
    parser.add_argument("--root", default=str(DEFAULT_PROJECT_ROOT), help="Project root. Default: {{PROJECT_ROOT}}")
    args = parser.parse_args()
    folder = create_folder(Path(args.root))
    print(folder)


if __name__ == "__main__":
    main()
