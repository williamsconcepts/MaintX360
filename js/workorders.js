(function (window, document) {
  "use strict";

  const DB = window.MaintProDB;
  const UI = window.MaintPro;

  function init() {
    if (document.body.dataset.page !== "workorders") {
      return;
    }

    UI.$$("[data-action='add-workorder']").forEach((button) => {
      button.addEventListener("click", () => openWorkOrderForm());
    });
    UI.$("#workOrderForm").addEventListener("submit", saveWorkOrder);
    UI.$("#workOrdersTableBody").addEventListener("click", handleTableClick);
    UI.$("#workOrdersTableBody").addEventListener("change", handleStatusChange);
    ["workOrderSearch", "workOrderStatusFilter", "workOrderPriorityFilter"].forEach((id) => {
      UI.$(`#${id}`).addEventListener("input", renderWorkOrders);
    });

    hydrateFilters();
    renderWorkOrders();
  }

  function hydrateFilters() {
    UI.fillSelect(UI.$("#workOrderStatusFilter"), DB.workOrderStatuses, "", "All statuses");
    UI.fillSelect(UI.$("#workOrderPriorityFilter"), DB.priorities, "", "All priorities");
    populateFormSelects();
  }

  function populateFormSelects(order) {
    const assets = DB.all("assets").map((asset) => ({
      value: asset.id,
      label: `${asset.assetId} - ${asset.name}`
    }));
    const technicians = DB.all("technicians").map((technician) => ({
      value: technician.id,
      label: `${technician.employeeId} - ${technician.name}`
    }));

    UI.fillSelect(UI.$("#workOrderAsset"), assets, order ? order.assetId : "", "Select asset");
    UI.fillSelect(UI.$("#workOrderTechnician"), technicians, order ? order.technicianId : "", "Assign technician");
    UI.fillSelect(UI.$("#workOrderPriority"), DB.priorities, order ? order.priority : "Medium", "Set priority");
    UI.fillSelect(UI.$("#workOrderStatus"), DB.workOrderStatuses, order ? order.status : "Open", "Set status");
  }

  function filteredWorkOrders() {
    const search = UI.$("#workOrderSearch").value.trim().toLowerCase();
    const status = UI.$("#workOrderStatusFilter").value;
    const priority = UI.$("#workOrderPriorityFilter").value;

    return DB.all("workOrders").filter((order) => {
      const haystack = [
        order.workOrderNumber,
        UI.assetLabel(order.assetId),
        order.description,
        order.priority,
        UI.technicianLabel(order.technicianId),
        order.status,
        order.dateCreated,
        order.dueDate
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesStatus = !status || order.status === status;
      const matchesPriority = !priority || order.priority === priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  function renderWorkOrders() {
    const rows = filteredWorkOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const body = UI.$("#workOrdersTableBody");
    UI.$("#workOrderCount").textContent = `${rows.length} work order${rows.length === 1 ? "" : "s"}`;
    body.innerHTML = rows.length
      ? rows
          .map(
            (order) => `
              <tr>
                <td><strong>${UI.escapeHTML(order.workOrderNumber)}</strong></td>
                <td>${UI.escapeHTML(UI.assetLabel(order.assetId))}</td>
                <td>${UI.escapeHTML(order.description)}</td>
                <td>${UI.priorityBadge(order.priority)}</td>
                <td>${UI.escapeHTML(UI.technicianLabel(order.technicianId))}</td>
                <td>
                  <select class="select compact-select" data-action="change-status" data-id="${order.id}" aria-label="Update status for ${UI.escapeHTML(order.workOrderNumber)}">
                    ${DB.workOrderStatuses
                      .map(
                        (status) =>
                          `<option value="${UI.escapeHTML(status)}"${status === order.status ? " selected" : ""}>${UI.escapeHTML(status)}</option>`
                      )
                      .join("")}
                  </select>
                </td>
                <td>${UI.formatDate(order.dateCreated)}</td>
                <td>${UI.formatDate(order.dueDate)}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost" type="button" data-action="edit-workorder" data-id="${order.id}">Edit</button>
                    <button class="btn btn-danger" type="button" data-action="delete-workorder" data-id="${order.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `
          )
          .join("")
      : UI.emptyRow(9, "No work orders match the current filters.");
  }

  function openWorkOrderForm(order) {
    const form = UI.$("#workOrderForm");
    form.reset();
    populateFormSelects(order);
    UI.$("#workOrderRecordId").value = order ? order.id : "";
    UI.$("#workOrderNumber").value = order ? order.workOrderNumber : DB.nextWorkOrderNumber();
    UI.$("#workOrderDescription").value = order ? order.description : "";
    UI.$("#workOrderDateCreated").value = order ? order.dateCreated : DB.todayISO();
    UI.$("#workOrderDueDate").value = order ? order.dueDate : DB.todayISO();
    UI.$("#workOrderModalTitle").textContent = order ? "Edit Work Order" : "Create Work Order";
    UI.openModal("workOrderModal");
  }

  function readForm() {
    return {
      workOrderNumber: UI.$("#workOrderNumber").value.trim(),
      assetId: UI.$("#workOrderAsset").value,
      description: UI.$("#workOrderDescription").value.trim(),
      priority: UI.$("#workOrderPriority").value,
      technicianId: UI.$("#workOrderTechnician").value,
      status: UI.$("#workOrderStatus").value,
      dateCreated: UI.$("#workOrderDateCreated").value,
      dueDate: UI.$("#workOrderDueDate").value
    };
  }

  function saveWorkOrder(event) {
    event.preventDefault();
    const id = UI.$("#workOrderRecordId").value;
    const data = readForm();
    const duplicate = DB.all("workOrders").find(
      (order) => order.workOrderNumber.toLowerCase() === data.workOrderNumber.toLowerCase() && order.id !== id
    );

    if (duplicate) {
      UI.showToast("Work order number already exists.", "error");
      return;
    }

    let saved;
    if (id) {
      saved = DB.update("workOrders", id, data);
      DB.logActivity("Work order updated", `${data.workOrderNumber} set to ${data.status}`);
      UI.showToast("Work order updated.");
    } else {
      saved = DB.create("workOrders", data);
      DB.logActivity("Work order created", `${data.workOrderNumber} for ${UI.assetLabel(data.assetId)}`);
      UI.showToast("Work order created.");
    }

    if (saved && saved.status === "Completed") {
      createHistoryFromCompletedOrder(saved);
    }

    UI.closeModal("workOrderModal");
    hydrateFilters();
    renderWorkOrders();
  }

  async function handleTableClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button || button.dataset.action === "change-status") {
      return;
    }

    const order = DB.get("workOrders", button.dataset.id);
    if (!order) {
      return;
    }

    if (button.dataset.action === "edit-workorder") {
      openWorkOrderForm(order);
      return;
    }

    if (button.dataset.action === "delete-workorder") {
      const confirmed = await UI.confirm({
        title: "Delete work order",
        message: `Delete ${order.workOrderNumber}? Maintenance history entries will not be removed.`,
        confirmText: "Delete",
        tone: "danger"
      });
      if (!confirmed) {
        return;
      }
      DB.remove("workOrders", order.id);
      DB.logActivity("Work order deleted", order.workOrderNumber);
      UI.showToast("Work order deleted.");
      renderWorkOrders();
    }
  }

  function handleStatusChange(event) {
    const select = event.target.closest("[data-action='change-status']");
    if (!select) {
      return;
    }
    const order = DB.get("workOrders", select.dataset.id);
    if (!order) {
      return;
    }
    const updated = DB.update("workOrders", order.id, { status: select.value });
    DB.logActivity("Work order status changed", `${order.workOrderNumber} set to ${select.value}`);
    if (updated.status === "Completed") {
      createHistoryFromCompletedOrder(updated);
    }
    UI.showToast("Work order status updated.");
    renderWorkOrders();
  }

  function createHistoryFromCompletedOrder(order) {
    const exists = DB.all("maintenanceHistory").some((record) => record.workOrderId === order.id);
    if (exists) {
      return;
    }
    DB.create("maintenanceHistory", {
      assetId: order.assetId,
      workOrderId: order.id,
      technicianId: order.technicianId,
      maintenanceType: order.description.slice(0, 80),
      maintenanceDate: DB.todayISO(),
      notes: `Completed from work order ${order.workOrderNumber}.`
    });
    DB.logActivity("Maintenance completed", `${order.workOrderNumber} closed and recorded`);
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
