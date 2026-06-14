(function (window, document) {
  "use strict";

  const DB = window.MaintProDB;
  const UI = window.MaintPro;
  let calendarDate = new Date();

  function init() {
    if (document.body.dataset.page !== "schedules") {
      return;
    }

    UI.$$("[data-action='add-schedule']").forEach((button) => {
      button.addEventListener("click", () => openScheduleForm());
    });
    UI.$("#scheduleForm").addEventListener("submit", saveSchedule);
    UI.$("#schedulesTableBody").addEventListener("click", handleTableClick);
    UI.$("#prevMonth").addEventListener("click", () => moveCalendar(-1));
    UI.$("#nextMonth").addEventListener("click", () => moveCalendar(1));
    UI.$("#scheduleStartDate").addEventListener("input", calculateDueDate);
    UI.$("#scheduleFrequency").addEventListener("change", calculateDueDate);
    ["scheduleSearch", "scheduleFrequencyFilter"].forEach((id) => {
      UI.$(`#${id}`).addEventListener("input", renderSchedules);
    });

    hydrateFilters();
    renderSchedules();
    renderCalendar();
  }

  function hydrateFilters() {
    UI.fillSelect(UI.$("#scheduleFrequencyFilter"), DB.frequencies, "", "All frequencies");
    populateFormSelects();
  }

  function populateFormSelects(schedule) {
    const assets = DB.all("assets").map((asset) => ({
      value: asset.id,
      label: `${asset.assetId} - ${asset.name}`
    }));
    UI.fillSelect(UI.$("#scheduleAsset"), assets, schedule ? schedule.assetId : "", "Select asset");
    UI.fillSelect(UI.$("#scheduleFrequency"), DB.frequencies, schedule ? schedule.frequency : "Monthly", "Select frequency");
  }

  function filteredSchedules() {
    const search = UI.$("#scheduleSearch").value.trim().toLowerCase();
    const frequency = UI.$("#scheduleFrequencyFilter").value;

    return DB.all("schedules").filter((schedule) => {
      const haystack = [
        UI.assetLabel(schedule.assetId),
        schedule.frequency,
        schedule.startDate,
        schedule.nextDueDate,
        schedule.maintenanceType
      ]
        .join(" ")
        .toLowerCase();
      return (!search || haystack.includes(search)) && (!frequency || schedule.frequency === frequency);
    });
  }

  function renderSchedules() {
    const rows = filteredSchedules().sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));
    UI.$("#scheduleCount").textContent = `${rows.length} schedule${rows.length === 1 ? "" : "s"}`;
    UI.$("#schedulesTableBody").innerHTML = rows.length
      ? rows
          .map(
            (schedule) => `
              <tr>
                <td>${UI.escapeHTML(UI.assetLabel(schedule.assetId))}</td>
                <td>${UI.escapeHTML(schedule.frequency)}</td>
                <td>${UI.formatDate(schedule.startDate)}</td>
                <td>${UI.formatDate(schedule.nextDueDate)}</td>
                <td>${UI.escapeHTML(schedule.maintenanceType)}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost" type="button" data-action="advance-schedule" data-id="${schedule.id}">Advance</button>
                    <button class="btn btn-ghost" type="button" data-action="edit-schedule" data-id="${schedule.id}">Edit</button>
                    <button class="btn btn-danger" type="button" data-action="delete-schedule" data-id="${schedule.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `
          )
          .join("")
      : UI.emptyRow(6, "No schedules match the current filters.");
  }

  function renderCalendar() {
    const calendar = UI.$("#scheduleCalendar");
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const title = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(calendarDate);
    const firstDay = new Date(year, month, 1).getDay();
    const start = new Date(year, month, 1 - firstDay);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const schedules = DB.all("schedules");
    const today = DB.todayISO();

    UI.$("#calendarTitle").textContent = title;
    calendar.innerHTML =
      weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join("") +
      Array.from({ length: 42 })
        .map((_, index) => {
          const date = new Date(start);
          date.setDate(start.getDate() + index);
          const iso = localISODate(date);
          const due = schedules.filter((schedule) => schedule.nextDueDate === iso);
          const classes = [
            "calendar-day",
            date.getMonth() === month ? "" : "outside",
            iso === today ? "today" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return `
            <div class="${classes}">
              <span class="calendar-date">${date.getDate()}</span>
              ${due
                .map(
                  (schedule) =>
                    `<span class="calendar-chip" title="${UI.escapeHTML(schedule.maintenanceType)}">${UI.escapeHTML(
                      UI.assetLabel(schedule.assetId)
                    )}</span>`
                )
                .join("")}
            </div>
          `;
        })
        .join("");
  }

  function moveCalendar(offset) {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1);
    renderCalendar();
  }

  function localISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function openScheduleForm(schedule) {
    UI.$("#scheduleForm").reset();
    populateFormSelects(schedule);
    UI.$("#scheduleRecordId").value = schedule ? schedule.id : "";
    UI.$("#scheduleStartDate").value = schedule ? schedule.startDate : DB.todayISO();
    UI.$("#scheduleNextDueDate").value = schedule
      ? schedule.nextDueDate
      : DB.calculateRollingNextDue(DB.todayISO(), "Monthly");
    UI.$("#scheduleMaintenanceType").value = schedule ? schedule.maintenanceType : "";
    UI.$("#scheduleModalTitle").textContent = schedule ? "Edit Maintenance Schedule" : "Create Maintenance Schedule";
    UI.openModal("scheduleModal");
  }

  function calculateDueDate() {
    const startDate = UI.$("#scheduleStartDate").value;
    const frequency = UI.$("#scheduleFrequency").value;
    UI.$("#scheduleNextDueDate").value = DB.calculateRollingNextDue(startDate, frequency);
  }

  function readForm() {
    return {
      assetId: UI.$("#scheduleAsset").value,
      frequency: UI.$("#scheduleFrequency").value,
      startDate: UI.$("#scheduleStartDate").value,
      nextDueDate: UI.$("#scheduleNextDueDate").value,
      maintenanceType: UI.$("#scheduleMaintenanceType").value.trim()
    };
  }

  function saveSchedule(event) {
    event.preventDefault();
    const id = UI.$("#scheduleRecordId").value;
    const data = readForm();

    if (id) {
      DB.update("schedules", id, data);
      DB.logActivity("Schedule updated", `${UI.assetLabel(data.assetId)} - ${data.maintenanceType}`);
      UI.showToast("Schedule updated.");
    } else {
      DB.create("schedules", data);
      DB.logActivity("Schedule created", `${UI.assetLabel(data.assetId)} - ${data.frequency}`);
      UI.showToast("Schedule created.");
    }

    UI.closeModal("scheduleModal");
    hydrateFilters();
    renderSchedules();
    renderCalendar();
  }

  async function handleTableClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }
    const schedule = DB.get("schedules", button.dataset.id);
    if (!schedule) {
      return;
    }

    if (button.dataset.action === "edit-schedule") {
      openScheduleForm(schedule);
      return;
    }

    if (button.dataset.action === "advance-schedule") {
      const nextDueDate = DB.calculateNextDue(schedule.nextDueDate, schedule.frequency);
      DB.update("schedules", schedule.id, { nextDueDate });
      DB.logActivity("Schedule advanced", `${UI.assetLabel(schedule.assetId)} next due ${UI.formatDate(nextDueDate)}`);
      UI.showToast("Schedule advanced.");
      renderSchedules();
      renderCalendar();
      return;
    }

    if (button.dataset.action === "delete-schedule") {
      const confirmed = await UI.confirm({
        title: "Delete schedule",
        message: `Delete the ${schedule.frequency.toLowerCase()} schedule for ${UI.assetLabel(schedule.assetId)}?`,
        confirmText: "Delete",
        tone: "danger"
      });
      if (!confirmed) {
        return;
      }
      DB.remove("schedules", schedule.id);
      DB.logActivity("Schedule deleted", `${UI.assetLabel(schedule.assetId)} - ${schedule.maintenanceType}`);
      UI.showToast("Schedule deleted.");
      hydrateFilters();
      renderSchedules();
      renderCalendar();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
