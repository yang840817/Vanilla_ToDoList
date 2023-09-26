import { fetchData, createData, updateData } from "./fetchData.js";
let data = [];
let draggingTask;
let targetTask;
const task_adding_container = document.querySelector(".task_adding_container");
const task_list = document.querySelector(".task_list_container");
const nav_list = document.querySelector(".nav_container ul");

nav_list.addEventListener("click", handleRouter);
function handleRouter(e) {
  e.preventDefault();
  history.pushState({}, "", e.target.href);
  nav_list
    .querySelectorAll("a")
    .forEach((node) => node.classList.remove("active"));
  e.target.classList.add("active");
  renderTaskList(data);
  changeLocation(data);
}
//    新增任務
task_adding_container.addEventListener("click", handleNewTaskClick);
task_adding_container.addEventListener("submit", handleNewTaskSubmit);
task_adding_container.addEventListener("input", handleTaskInput);
//    任務列表清單
task_list.addEventListener("click", handleTaskListClick);
task_list.addEventListener("submit", handleTaskListSubmit);
task_list.addEventListener("input", handleTaskInput);
//    拖曳事件
task_list.addEventListener("drag", (e) => {
  e.target.style.opacity = "0";
});
task_list.addEventListener("dragstart", (e) => {
  draggingTask = e.target;
});
task_list.addEventListener("dragenter", handleDragenter);
task_list.addEventListener("dragend", handleDragend);
task_list.addEventListener("dragover", (e) => {
  e.preventDefault();
});

//  初始載入頁面拿資料＆渲染＆排序
(async () => {
  data = await fetchData();
  const filterData = filterDataByURL([...data]);
  renderTaskList(filterData);
  changeLocation(filterData);
})();

//  （共用）添加檔案 listener函式
function handleTaskInput(e) {
  const targetForm = e.target.closest("form");
  if (e.target.type === "file") {
    const nowTimeStamp = Date.now();
    if (e.target.files.length) {
      if (targetForm.querySelector(".file_information")) {
        targetForm.querySelector(".file_information").remove();
      }
      const file = e.target.files[0];
      const fileInformation = document.createElement("div");
      fileInformation.classList.add("file_information");
      fileInformation.innerHTML = `<span class="file_name">${file.name}</span>
    <span class="file_time" data-time="${nowTimeStamp}">${new Date(
        nowTimeStamp
      ).toLocaleDateString()}</span>`;
      e.target
        .closest(".file_container")
        .insertBefore(
          fileInformation,
          e.target.closest(".file_container").firstChild
        );
    }
  }
}
//  新增任務容器 事件listener函式
async function handleNewTaskSubmit(e) {
  const nowTimeStamp = Date.now();
  e.preventDefault();
  const form = e.target.closest("form");
  const fileName = form.querySelector(".file_name");
  const fileTime = form.querySelector(".file_time");
  const newTaskData = JSON.stringify({
    records: [
      {
        fields: {
          created: nowTimeStamp,
          title: form.querySelector('[type="text"]').value,
          comment: form.querySelector("textarea").value,
          deadLine: new Date(
            `${form.querySelector(`[type="date"]`).value} ${
              form.querySelector(`[type="time"]`).value
            }`
          ).getTime(),
          fileName: fileName ? fileName.textContent : null,
          fileUploadTime: fileTime ? Number(fileTime.dataset.time) : null,
          important: form.classList.contains("important_task"),
          finished: form.querySelector(`[type="checkbox"]`).checked,
          locationBefore: "",
          lastDragged: nowTimeStamp,
        },
      },
    ],
  });
  resetAddingContainerStyle(form);
  form.reset();
  await createData(newTaskData);
  data = await fetchData();
  renderTaskList(data);
  changeLocation(data);
}
function handleNewTaskClick(e) {
  const form = this.querySelector("form");
  if (
    e.target.classList.contains(`task_adding_icon`) ||
    e.target.parentNode.classList.contains(`task_adding_icon`)
  ) {
    task_adding_container.classList.add("adding");
  }
  if (
    e.target.classList.contains("subscribe") ||
    e.target.parentNode.classList.contains("subscribe")
  ) {
    form.classList.toggle("important_task");
  }
  if (e.target.type === "checkbox") {
    form.classList.toggle("finished_task");
  }
  if (e.target.type === "reset" || e.target.parentNode.type === "reset") {
    resetAddingContainerStyle(form);
  }
}
//  新增任務容器 重置樣式函式
function resetAddingContainerStyle(form) {
  task_adding_container.classList.remove("adding");
  form.classList.remove("important_task");
  form.classList.remove("finished_task");
  if (form.querySelector(".file_information")) {
    form.querySelector(".file_information").remove();
  }
}
//  任務列表容器 事件listener函式
async function handleTaskListSubmit(e) {
  const nowTimeStamp = Date.now();
  e.preventDefault();
  const form = e.target.closest("form");
  const fileName = form.querySelector(".file_name");
  const fileTime = form.querySelector(".file_time");
  console.log(fileName);
  console.dir(fileName);
  const newTaskData = JSON.stringify({
    records: [
      {
        id: form.id,
        fields: {
          title: form.querySelector('[type="text"]').value,
          comment: form.querySelector("textarea").value,
          deadLine: new Date(
            `${form.querySelector(`[type="date"]`).value} ${
              form.querySelector(`[type="time"]`).value
            }`
          ).getTime(),
          fileName: fileName ? fileName.textContent : null,
          fileUploadTime: fileTime ? Number(fileTime.dataset.time) : null,
          important: form.classList.contains("important_task"),
          finished: form.querySelector(`[type="checkbox"]`).checked,
          locationBefore: "",
          lastDragged: nowTimeStamp,
        },
      },
    ],
  });
  await updateData(newTaskData);
  data = await fetchData();
  renderTaskList(data);
  changeLocation(data);
}
async function handleTaskListClick(e) {
  const targetForm = e.target.closest("form");
  if (
    e.target.classList.contains("editing") ||
    e.target.parentNode.classList.contains("editing") ||
    e.target.type === "reset" ||
    e.target.parentNode.type === "reset"
  ) {
    const item = data.find((item) => item.id === targetForm.id);
    if (targetForm.classList.contains("editing_task")) {
      targetForm.innerHTML = formContent(item);
    } else {
      targetForm.querySelector(`[type="text"]`).disabled = false;
      targetForm.querySelector(".subscribe").disabled = true;
      targetForm.querySelector(`[type="checkbox"]`).disabled = true;
    }
    targetForm.classList.toggle("editing_task");
    if (item.fields.important) {
      targetForm.classList.add("important_task");
    } else {
      targetForm.classList.remove("important_task");
    }
  }

  if (
    e.target.classList.contains("subscribe") ||
    e.target.parentNode.classList.contains("subscribe")
  ) {
    targetForm.classList.toggle("important_task");
    if (!targetForm.classList.contains("editing_task")) {
      const newTaskData = JSON.stringify({
        records: [
          {
            id: targetForm.id,
            fields: {
              important: targetForm.classList.contains("important_task"),
            },
          },
        ],
      });
      await updateData(newTaskData);
      data = await fetchData();
      renderTaskList(data);
      changeLocation(data);
    }
  }
  if (e.target.type === "checkbox") {
    targetForm.classList.toggle("finished_task");
    // if (!targetForm.classList.contains("editing_task")) {
    const newTaskData = JSON.stringify({
      records: [
        {
          id: targetForm.id,
          fields: {
            finished: targetForm.classList.contains("finished_task"),
          },
        },
      ],
    });
    const thisForm = data.find(
      (item) => item.id === e.target.closest("form").id
    );
    thisForm.fields.finished = !thisForm.fields.finished;
    renderTaskList(data);
    changeLocation(data);
    await updateData(newTaskData);
    data = await fetchData();
    renderTaskList(data);
    changeLocation(data);
  }
  //   }
}
//  任務列表容器 Drag事件listener函式
async function handleDragend(e) {
  const nextForm = e.target.nextElementSibling;
  draggingTask.style.opacity = 1;
  const editTaskData = JSON.stringify({
    records: [
      {
        id: draggingTask.id,
        fields: {
          locationBefore: nextForm ? nextForm.id : "lastChild",
          lastDragged: Date.now(),
        },
      },
    ],
  });
  await updateData(editTaskData);
  data = await fetchData();
  renderTaskList(data);
  changeLocation(data);
}
function handleDragenter(e) {
  targetTask = e.target.closest("form");
  if (targetTask === draggingTask || targetTask === null) {
    return;
  }
  let liArray = Array.from(task_list.querySelectorAll("form"));
  let currentIndex = liArray.indexOf(draggingTask);
  let targetIndex = liArray.indexOf(targetTask);

  if (currentIndex < targetIndex) {
    task_list.insertBefore(draggingTask, targetTask.nextElementSibling);
  } else {
    task_list.insertBefore(draggingTask, targetTask);
  }
}
// 任務列表渲染＆排序函式
function renderTaskList(data) {
  const taskList = document.querySelector(".task_list_container");
  const filterData = filterDataByURL(data);
  taskList.innerHTML = filterData
    .map((item) => {
      return `<form id="${item.id}" class="task_container${
        item.fields.important ? " important_task" : ""
      }${
        item.fields.finished ? " finished_task" : ""
      }" draggable="true">${formContent(item)}</form>`;
    })
    .join("");
}
function formContent(item) {
  const deadLineDate = new Date(item.fields.deadLine).toLocaleDateString();
  const deadLineDateInput = new Date(item.fields.deadLine)
    .toISOString()
    .match(/^\d+-\d+-\d+/);
  const deadLineTimeInput = new Date(item.fields.deadLine)
    .toTimeString()
    .match(/^\d+:\d+/);
  return `<div class="task_title">
              <input type="checkbox"${item.fields.finished ? " checked" : ""}/>
              <div class="task_title_dashboard">
                <div>
                  <input
                    type="text"
                    required="required"
                    placeholder="Typing something Here..."
                    value="${item.fields.title}"
                    disabled
                  />
                  <button class="subscribe" type="button">
                    <i class="fa-regular fa-star"></i>
                  </button>
                  <button class="editing" type="button">
                    <i class="fa-light fa-pen"></i>
                  </button>
                </div>
                <div class="task_title_status">
                  <span>
                    <i class="fa-solid fa-calendar-days"></i>
                    ${deadLineDate}
                  </span>
                  ${
                    item.fields.fileName
                      ? `<i class="fa-light fa-file"></i>`
                      : ""
                  }
                  ${
                    item.fields.comment
                      ? `<i class="fa-regular fa-comment-dots"></i>`
                      : ""
                  }
                </div>
              </div>
            </div>
            <div class="task_content">
              <div>
                <i class="fa-solid fa-calendar-days"></i>
                <div class="task_content_subtitle">
                  <p>Deadline</p>
                  <div class="date_container">
                    <input type="date" required="required" value="${deadLineDateInput}"/>
                    <input type="time" required="required" data-time=${
                      item.fields.fileUploadTime
                    } value="${deadLineTimeInput}"/>
                  </div>
                </div>
              </div>
              <div>
                <i class="fa-light fa-file"></i>
                <div class="task_content_subtitle">
                  <p>File</p>
                  <div class="file_container">
                    ${
                      item.fields.fileName
                        ? `<div class="file_information">
                        <span class="file_name">${item.fields.fileName}</span>
                        <span class="file_time" data-time="${
                          item.fields.fileUploadTime
                        }">${new Date(
                            item.fields.fileUploadTime
                          ).toLocaleDateString()}</span>
                      </div>`
                        : ``
                    }
                    <label for="file-${item.id}" class="add_file">
                      <i class="fa-light fa-plus"></i>
                      <input id="file-${item.id}" type="file" />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <i class="fa-regular fa-comment-dots"></i>
                <div class="task_content_subtitle">
                  <p>Comment</p>
                  <textarea
                    name="message"
                    rows="5"
                    placeholder="Type your memo here..."
                  >${item.fields.comment ? item.fields.comment : ""}</textarea>
                </div>
              </div>
            </div>
            <div class="task_control">
              <button type="reset">
                <i class="fa-light fa-xmark"></i>
                <span>Cancel</span>
              </button>
              <button type="submit">
                <i class="fa-light fa-plus"></i>
                <span>Save</span>
              </button>
            </div>`;
}
function changeLocation(data) {
  const list = document.querySelector(".task_list_container");
  const filterData = filterDataByURL([...data]);
  filterData
    .sort((a, b) => a.fields.lastDragged - b.fields.lastDragged)
    .filter((item) => item.fields.locationBefore)
    .forEach((item) => {
      const currentTask = list.querySelector(`#${item.id}`);
      //   console.log("self", currentTask);
      const targetTask = list.querySelector(`#${item.fields.locationBefore}`);
      //   console.log("target", targetTask);
      if (targetTask) {
        list.insertBefore(currentTask, targetTask);
      } else {
        list.appendChild(currentTask);
      }
    });
}
function filterDataByURL(data) {
  if (document.URL.includes("inProgress")) {
    return [...data].filter((item) => !item.fields.finished);
  } else if (document.URL.includes("Completed")) {
    return [...data].filter((item) => item.fields.finished);
  } else return data;
}
