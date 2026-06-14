(function (window, document) {
  "use strict";

  const DB = window.MaintProDB;
  const UI = window.MaintPro;

  function init() {
    if (document.body.dataset.page !== "technicians") {
      return;
    }

    UI.$$("[data-action='add-technician']").forEach((button) => {
      button.addEventListener("click", () => openTechnicianForm());
    });
    UI.$("#technicianForm").addEventListener("submit", saveTechnician);
    UI.$("#techniciansTableBody").addEventListener("click", handleTableClick);
    ["technicianSearch", "technicianSkillFilter", "technicianDepartmentFilter"].forEach((id) => {
      UI.$(`#${id}`).addEventListener("input", renderTechnicians);
    });

    hydrateFilters();
    renderTechnicians();
  }

  function hydrateFilters() {
    const technicians = DB.all("technicians");
    UI.fillSelect(UI.$("#technicianSkillFilter"), unique(technicians.map((item) => item.skill)).sort(), "", "All skills");
    UI.fillSelect(
      UI.$("#technicianDepartmentFilter"),
      unique(technicians.map((item) => item.department)).sort(),
      "",
      "All departments"
    );
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function activeJobs(technicianId) {
    return DB.all("workOrders").filter(
      (order) => order.technicianId === technicianId && !["Completed", "Cancelled"].includes(order.status)
    );
  }

  function filteredTechnicians() {
    const search = UI.$("#technicianSearch").value.trim().toLowerCase();
    const skill = UI.$("#technicianSkillFilter").value;
    const department = UI.$("#technicianDepartmentFilter").value;

    return DB.all("technicians").filter((technician) => {
      const haystack = [
        technician.employeeId,
        technician.name,
        technician.skill,
        technician.department,
        technician.phone
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesSkill = !skill || technician.skill === skill;
      const matchesDepartment = !department || technician.department === department;
      return matchesSearch && matchesSkill && matchesDepartment;
    });
  }

  function renderTechnicians() {
    const rows = filteredTechnicians().sort((a, b) => a.name.localeCompare(b.name));
    UI.$("#technicianCount").textContent = `${rows.length} technician${rows.length === 1 ? "" : "s"}`;
    UI.$("#techniciansTableBody").innerHTML = rows.length
      ? rows
          .map((technician) => {
            const jobs = activeJobs(technician.id);
            return `
              <tr>
                <td><strong>${UI.escapeHTML(technician.employeeId)}</strong></td>
                <td>${UI.escapeHTML(technician.name)}</td>
                <td>${UI.escapeHTML(technician.skill)}</td>
                <td>${UI.escapeHTML(technician.department)}</td>
                <td>${UI.escapeHTML(technician.phone)}</td>
                <td>
                  <button class="link-button" type="button" data-action="view-jobs" data-id="${technician.id}">
                    ${jobs.length} active
                  </button>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost" type="button" data-action="edit-technician" data-id="${technician.id}">Edit</button>
                    <button class="btn btn-danger" type="button" data-action="delete-technician" data-id="${technician.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `;
          })
          .join("")
      : UI.emptyRow(7, "No technicians match the current filters.");
  }

  function openTechnicianForm(technician) {
    UI.$("#technicianForm").reset();
    UI.$("#technicianRecordId").value = technician ? technician.id : "";
    UI.$("#employeeId").value = technician ? technician.employeeId : nextEmployeeId();
    UI.$("#technicianName").value = technician ? technician.name : "";
    UI.$("#technicianSkill").value = technician ? technician.skill : "";
    UI.$("#technicianDepartment").value = technician ? technician.department : "";
    UI.$("#technicianPhone").value = technician ? technician.phone : "";
    UI.$("#technicianModalTitle").textContent = technician ? "Edit Technician" : "Add Technician";
    UI.openModal("technicianModal");
  }

  function nextEmployeeId() {
    const count = DB.all("technicians").length + 410;
    return `EMP-${count}`;
  }

  function readForm() {
    return {
      employeeId: UI.$("#employeeId").value.trim(),
      name: UI.$("#technicianName").value.trim(),
      skill: UI.$("#technicianSkill").value.trim(),
      department: UI.$("#technicianDepartment").value.trim(),
      phone: UI.$("#technicianPhone").value.trim()
    };
  }

  function saveTechnician(event) {
    event.preventDefault();
    const id = UI.$("#technicianRecordId").value;
    const data = readForm();
    const duplicate = DB.all("technicians").find(
      (technician) => technician.employeeId.toLowerCase() === data.employeeId.toLowerCase() && technician.id !== id
    );

    if (duplicate) {
      UI.showToast("Employee ID already exists.", "error");
      return;
    }

    if (id) {
      DB.update("technicians", id, data);
      DB.logActivity("Technician updated", `${data.employeeId} - ${data.name}`);
      UI.showToast("Technician updated.");
    } else {
      DB.create("technicians", data);
      DB.logActivity("Technician added", `${data.employeeId} - ${data.name}`);
      UI.showToast("Technician added.");
    }

    UI.closeModal("technicianModal");
    hydrateFilters();
    renderTechnicians();
  }

  async function handleTableClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }
    const technician = DB.get("technicians", button.dataset.id);
    if (!technician) {
      return;
    }

    if (button.dataset.action === "view-jobs") {
      showAssignedJobs(technician);
      return;
    }

    if (button.dataset.action === "edit-technician") {
      openTechnicianForm(technician);
      return;
    }

    if (button.dataset.action === "delete-technician") {
      const confirmed = await UI.confirm({
        title: "Delete technician",
        message: `Delete ${technician.employeeId} - ${technician.name}? Assigned open work orders will become unassigned.`,
        confirmText: "Delete",
        tone: "danger"
      });
      if (!confirmed) {
        return;
      }
      DB.remove("technicians", technician.id);
      unassignWorkOrders(technician.id);
      DB.logActivity("Technician deleted", `${technician.employeeId} - ${technician.name}`);
      UI.showToast("Technician deleted.");
      hydrateFilters();
      renderTechnicians();
    }
  }

  function showAssignedJobs(technician) {
    const jobs = DB.all("workOrders").filter((order) => order.technicianId === technician.id);
    UI.$("#technicianJobsTitle").textContent = `Assigned Jobs - ${technician.name}`;
    UI.$("#technicianJobsList").innerHTML = jobs.length
      ? jobs
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
          .map(
            (order) => `
              <article class="job-row">
                <strong>${UI.escapeHTML(order.workOrderNumber)} · ${UI.escapeHTML(order.status)}</strong>
                <span>${UI.escapeHTML(UI.assetLabel(order.assetId))}</span>
                <span>${UI.escapeHTML(order.description)}</span>
                <span>Due ${UI.formatDate(order.dueDate)} · ${UI.escapeHTML(order.priority)} priority</span>
              </article>
            `
          )
          .join("")
      : `<p class="empty-state">No jobs assigned to this technician.</p>`;
    UI.openModal("technicianJobsModal");
  }

  function unassignWorkOrders(technicianId) {
    const orders = DB.all("workOrders").map((order) =>
      order.technicianId === technicianId ? { ...order, technicianId: "", updatedAt: new Date().toISOString() } : order
    );
    DB.saveAll("workOrders", orders);
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
