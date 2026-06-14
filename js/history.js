(function (window, document) {
  "use strict";

  const DB = window.MaintProDB;
  const UI = window.MaintPro;

  function init() {
    if (document.body.dataset.page !== "history") {
      return;
    }

    UI.$$("[data-action='add-history']").forEach((button) => {
      button.addEventListener("click", () => openHistoryForm());
    });
    UI.$("#historyForm").addEventListener("submit", saveHistory);
    UI.$("#historyTableBody").addEventListener("click", handleTableClick);
    UI.$("#historyWorkOrder").addEventListener("change", prefillFromWorkOrder);
    ["historySearch", "historyAssetFilter", "historyTechnicianFilter"].forEach((id) => {
      UI.$(`#${id}`).addEventListener("input", renderHistory);
    });

    hydrateFilters();
    renderReports();
    renderHistory();
  }

  function hydrateFilters() {
    const assets = DB.all("assets").map((asset) => ({
      value: asset.id,
      label: `${asset.assetId} - ${asset.name}`
    }));
    const technicians = DB.all("technicians").map((technician) => ({
      value: technician.id,
      label: `${technician.employeeId} - ${technician.name}`
    }));

    UI.fillSelect(UI.$("#historyAssetFilter"), assets, "", "All assets");
    UI.fillSelect(UI.$("#historyTechnicianFilter"), technicians, "", "All technicians");
    populateFormSelects();
  }

  function populateFormSelects(record) {
    const assets = DB.all("assets").map((asset) => ({
      value: asset.id,
      label: `${asset.assetId} - ${asset.name}`
    }));
    const technicians = DB.all("technicians").map((technician) => ({
      value: technician.id,
      label: `${technician.employeeId} - ${technician.name}`
    }));
    const workOrders = DB.all("workOrders").map((order) => ({
      value: order.id,
      label: `${order.workOrderNumber} - ${UI.assetLabel(order.assetId)}`
    }));

    UI.fillSelect(UI.$("#historyAsset"), assets, record ? record.assetId : "", "Select asset");
    UI.fillSelect(UI.$("#historyTechnician"), technicians, record ? record.technicianId : "", "Select technician");
    UI.fillSelect(UI.$("#historyWorkOrder"), workOrders, record ? record.workOrderId : "", "No linked work order");
  }

  function filteredHistory() {
    const search = UI.$("#historySearch").value.trim().toLowerCase();
    const assetId = UI.$("#historyAssetFilter").value;
    const technicianId = UI.$("#historyTechnicianFilter").value;

    return DB.all("maintenanceHistory").filter((record) => {
      const haystack = [
        record.maintenanceDate,
        UI.assetLabel(record.assetId),
        UI.technicianLabel(record.technicianId),
        UI.workOrderLabel(record.workOrderId),
        record.maintenanceType,
        record.notes
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!search || haystack.includes(search)) &&
        (!assetId || record.assetId === assetId) &&
        (!technicianId || record.technicianId === technicianId)
      );
    });
  }

  function renderHistory() {
    const rows = filteredHistory().sort((a, b) => b.maintenanceDate.localeCompare(a.maintenanceDate));
    UI.$("#historyCountLabel").textContent = `${rows.length} record${rows.length === 1 ? "" : "s"}`;
    UI.$("#historyTableBody").innerHTML = rows.length
      ? rows
          .map(
            (record) => `
              <tr>
                <td>${UI.formatDate(record.maintenanceDate)}</td>
                <td>${UI.escapeHTML(UI.assetLabel(record.assetId))}</td>
                <td>${UI.escapeHTML(UI.workOrderLabel(record.workOrderId))}</td>
                <td>${UI.escapeHTML(UI.technicianLabel(record.technicianId))}</td>
                <td>${UI.escapeHTML(record.maintenanceType)}</td>
                <td>${UI.escapeHTML(record.notes)}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost" type="button" data-action="edit-history" data-id="${record.id}">Edit</button>
                    <button class="btn btn-danger" type="button" data-action="delete-history" data-id="${record.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `
          )
          .join("")
      : UI.emptyRow(7, "No maintenance records match the current filters.");
  }

  function renderReports() {
    const assets = DB.all("assets");
    const technicians = DB.all("technicians");
    const workOrders = DB.all("workOrders");
    const history = DB.all("maintenanceHistory");
    const currentMonth = DB.todayISO().slice(0, 7);
    const completed = workOrders.filter((order) => order.status === "Completed").length;
    const completionRate = workOrders.length ? Math.round((completed / workOrders.length) * 100) : 0;
    const overdue = workOrders.filter(
      (order) => !["Completed", "Cancelled"].includes(order.status) && order.dueDate < DB.todayISO()
    ).length;
    const assetsInMaintenance = assets.filter((asset) => asset.status === "Maintenance").length;

    setText("totalHistoryRecords", history.length);
    setText("monthlyHistoryRecords", history.filter((record) => record.maintenanceDate.startsWith(currentMonth)).length);
    setText("reportCompletionRate", `${completionRate}%`);
    setText("overdueWorkOrders", overdue);
    setText("maintenanceAssets", assetsInMaintenance);
    setText("activeTechnicians", technicians.length);

    renderCharts(assets, workOrders, history);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function renderCharts(assets, workOrders, history) {
    if (!window.Chart) {
      UI.$$(".chart-fallback").forEach((item) => {
        item.hidden = false;
      });
      return;
    }

    const colors = UI.chartColors();
    const assetStatus = UI.countBy(assets, "status");
    const workOrderStatus = UI.countBy(workOrders, "status");
    const monthly = UI.monthlyHistoryCounts(history);

    UI.buildChart("assetStatusReportChart", {
      type: "doughnut",
      data: {
        labels: Object.keys(assetStatus),
        datasets: [
          {
            data: Object.values(assetStatus),
            backgroundColor: [colors.green, colors.amber, colors.red, colors.slate],
            borderColor: "#0b1733",
            borderWidth: 2
          }
        ]
      },
      options: UI.doughnutOptions()
    });

    UI.buildChart("workOrderStatusReportChart", {
      type: "bar",
      data: {
        labels: Object.keys(workOrderStatus),
        datasets: [
          {
            label: "Work orders",
            data: Object.values(workOrderStatus),
            backgroundColor: [colors.cyan, colors.blue, colors.amber, colors.green, colors.red],
            borderRadius: 6
          }
        ]
      },
      options: UI.axisOptions()
    });

    UI.buildChart("monthlyMaintenanceReportChart", {
      type: "line",
      data: {
        labels: monthly.labels,
        datasets: [
          {
            label: "Maintenance records",
            data: monthly.values,
            borderColor: colors.cyan,
            backgroundColor: "rgba(56, 189, 248, 0.14)",
            pointBackgroundColor: colors.cyan,
            pointBorderColor: "#071126",
            tension: 0.35,
            fill: true
          }
        ]
      },
      options: UI.axisOptions()
    });
  }

  function openHistoryForm(record) {
    UI.$("#historyForm").reset();
    populateFormSelects(record);
    UI.$("#historyRecordId").value = record ? record.id : "";
    UI.$("#historyMaintenanceType").value = record ? record.maintenanceType : "";
    UI.$("#historyDate").value = record ? record.maintenanceDate : DB.todayISO();
    UI.$("#historyNotes").value = record ? record.notes : "";
    UI.$("#historyModalTitle").textContent = record ? "Edit Maintenance Record" : "Record Completed Maintenance";
    UI.openModal("historyModal");
  }

  function prefillFromWorkOrder() {
    const order = DB.get("workOrders", UI.$("#historyWorkOrder").value);
    if (!order) {
      return;
    }
    UI.$("#historyAsset").value = order.assetId;
    UI.$("#historyTechnician").value = order.technicianId;
    UI.$("#historyMaintenanceType").value = order.description.slice(0, 80);
  }

  function readForm() {
    return {
      assetId: UI.$("#historyAsset").value,
      workOrderId: UI.$("#historyWorkOrder").value,
      technicianId: UI.$("#historyTechnician").value,
      maintenanceType: UI.$("#historyMaintenanceType").value.trim(),
      maintenanceDate: UI.$("#historyDate").value,
      notes: UI.$("#historyNotes").value.trim()
    };
  }

  function saveHistory(event) {
    event.preventDefault();
    const id = UI.$("#historyRecordId").value;
    const data = readForm();

    if (id) {
      DB.update("maintenanceHistory", id, data);
      DB.logActivity("Maintenance record updated", `${UI.assetLabel(data.assetId)} - ${data.maintenanceType}`);
      UI.showToast("Maintenance record updated.");
    } else {
      DB.create("maintenanceHistory", data);
      DB.logActivity("Maintenance completed", `${UI.assetLabel(data.assetId)} - ${data.maintenanceType}`);
      UI.showToast("Maintenance record saved.");
    }

    if (data.workOrderId) {
      const order = DB.get("workOrders", data.workOrderId);
      if (order && order.status !== "Completed") {
        DB.update("workOrders", order.id, { status: "Completed" });
        DB.logActivity("Work order completed", order.workOrderNumber);
      }
    }

    UI.closeModal("historyModal");
    hydrateFilters();
    renderReports();
    renderHistory();
  }

  async function handleTableClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }
    const record = DB.get("maintenanceHistory", button.dataset.id);
    if (!record) {
      return;
    }

    if (button.dataset.action === "edit-history") {
      openHistoryForm(record);
      return;
    }

    if (button.dataset.action === "delete-history") {
      const confirmed = await UI.confirm({
        title: "Delete maintenance record",
        message: `Delete the record for ${UI.assetLabel(record.assetId)} on ${UI.formatDate(record.maintenanceDate)}?`,
        confirmText: "Delete",
        tone: "danger"
      });
      if (!confirmed) {
        return;
      }
      DB.remove("maintenanceHistory", record.id);
      DB.logActivity("Maintenance record deleted", `${UI.assetLabel(record.assetId)} - ${record.maintenanceType}`);
      UI.showToast("Maintenance record deleted.");
      renderReports();
      renderHistory();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
