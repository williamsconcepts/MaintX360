(function (window, document) {
  "use strict";

  const DB = window.MaintProDB;
  const charts = {};

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function formatDate(value) {
    if (!value) {
      return "Not set";
    }
    const date = new Date(`${value}`.includes("T") ? value : `${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    }).format(date);
  }

  function formatDateTime(value) {
    if (!value) {
      return "Not set";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeClass(value) {
    return String(value || "unknown")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function badge(value, type) {
    return `<span class="badge badge-${type || normalizeClass(value)}">${escapeHTML(value || "Not set")}</span>`;
  }

  function priorityBadge(value) {
    return `<span class="badge priority-${normalizeClass(value)}">${escapeHTML(value || "Not set")}</span>`;
  }

  function assetLabel(assetId) {
    const asset = DB.get("assets", assetId);
    return asset ? `${asset.assetId} - ${asset.name}` : "Unassigned asset";
  }

  function technicianLabel(technicianId) {
    const technician = DB.get("technicians", technicianId);
    return technician ? `${technician.employeeId} - ${technician.name}` : "Unassigned";
  }

  function workOrderLabel(workOrderId) {
    const order = DB.get("workOrders", workOrderId);
    return order ? order.workOrderNumber : "No work order";
  }

  function emptyRow(colspan, label) {
    return `<tr><td colspan="${colspan}" class="empty-state">${escapeHTML(label)}</td></tr>`;
  }

  function fillSelect(select, options, selectedValue, placeholder) {
    if (!select) {
      return;
    }
    const first = placeholder ? `<option value="">${escapeHTML(placeholder)}</option>` : "";
    select.innerHTML =
      first +
      options
        .map((option) => {
          const value = typeof option === "object" ? option.value : option;
          const label = typeof option === "object" ? option.label : option;
          const selected = value === selectedValue ? " selected" : "";
          return `<option value="${escapeHTML(value)}"${selected}>${escapeHTML(label)}</option>`;
        })
        .join("");
  }

  function showToast(message, type) {
    const container = getToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast-${type || "success"}`;
    toast.setAttribute("role", "status");
    toast.innerHTML = `
      <span class="toast-dot"></span>
      <span>${escapeHTML(message)}</span>
      <button class="toast-close" type="button" aria-label="Dismiss notification">x</button>
    `;
    container.appendChild(toast);
    const dismiss = () => {
      toast.classList.add("toast-leaving");
      window.setTimeout(() => toast.remove(), 180);
    };
    $(".toast-close", toast).addEventListener("click", dismiss);
    window.setTimeout(dismiss, 4200);
  }

  function getToastContainer() {
    let container = $("#toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) {
      return;
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-lock");
    const focusable = $("input, select, textarea, button", modal);
    if (focusable) {
      window.setTimeout(() => focusable.focus(), 30);
    }
  }

  function closeModal(id) {
    const modal = typeof id === "string" ? document.getElementById(id) : id;
    if (!modal) {
      return;
    }
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (!$(".modal.is-open")) {
      document.body.classList.remove("modal-lock");
    }
  }

  function confirmDialog(options) {
    const dialog = ensureConfirmDialog();
    const title = $("#confirmTitle", dialog);
    const message = $("#confirmMessage", dialog);
    const confirmButton = $("#confirmAction", dialog);
    const cancelButton = $("#confirmCancel", dialog);

    title.textContent = options.title || "Confirm action";
    message.textContent = options.message || "Please confirm this action.";
    confirmButton.textContent = options.confirmText || "Confirm";
    confirmButton.className = `btn ${options.tone === "danger" ? "btn-danger" : "btn-primary"}`;

    openModal("confirmModal");

    return new Promise((resolve) => {
      const cleanup = (answer) => {
        confirmButton.removeEventListener("click", onConfirm);
        cancelButton.removeEventListener("click", onCancel);
        closeModal("confirmModal");
        resolve(answer);
      };
      const onConfirm = () => cleanup(true);
      const onCancel = () => cleanup(false);
      confirmButton.addEventListener("click", onConfirm);
      cancelButton.addEventListener("click", onCancel);
    });
  }

  function ensureConfirmDialog() {
    let dialog = $("#confirmModal");
    if (dialog) {
      return dialog;
    }
    dialog = document.createElement("div");
    dialog.id = "confirmModal";
    dialog.className = "modal";
    dialog.setAttribute("aria-hidden", "true");
    dialog.innerHTML = `
      <div class="modal-backdrop" data-close-modal="confirmModal"></div>
      <section class="modal-panel modal-panel-small" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
        <div class="modal-header">
          <h2 id="confirmTitle">Confirm action</h2>
          <button class="icon-btn" type="button" data-close-modal="confirmModal" aria-label="Close dialog">x</button>
        </div>
        <p id="confirmMessage" class="confirm-copy"></p>
        <div class="modal-actions">
          <button id="confirmCancel" class="btn btn-secondary" type="button">Cancel</button>
          <button id="confirmAction" class="btn btn-danger" type="button">Confirm</button>
        </div>
      </section>
    `;
    document.body.appendChild(dialog);
    return dialog;
  }

  function setupShell() {
    const currentPage = document.body.dataset.page || "dashboard";
    $$("[data-nav]").forEach((link) => {
      if (link.dataset.nav === currentPage) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });

    const menuButton = $("#menuButton");
    if (menuButton) {
      menuButton.addEventListener("click", () => {
        document.body.classList.toggle("sidebar-open");
      });
    }

    const sidebarShade = $("#sidebarShade");
    if (sidebarShade) {
      sidebarShade.addEventListener("click", () => {
        document.body.classList.remove("sidebar-open");
      });
    }

    document.addEventListener("click", (event) => {
      const closeTarget = event.target.closest("[data-close-modal]");
      if (closeTarget) {
        closeModal(closeTarget.dataset.closeModal);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        $$(".modal.is-open").forEach((modal) => closeModal(modal));
        document.body.classList.remove("sidebar-open");
      }
    });
  }

  function countBy(records, key) {
    return records.reduce((acc, record) => {
      const value = record[key] || "Not set";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  function setText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  function initDashboard() {
    if (document.body.dataset.page !== "dashboard") {
      return;
    }

    const assets = DB.all("assets");
    const schedules = DB.all("schedules");
    const workOrders = DB.all("workOrders");
    const history = DB.all("maintenanceHistory");
    const activeOrders = workOrders.filter((order) => !["Completed", "Cancelled"].includes(order.status));
    const completedOrders = workOrders.filter((order) => order.status === "Completed");
    const upcoming = schedules.filter((schedule) => schedule.nextDueDate >= DB.todayISO());
    const completionRate = workOrders.length
      ? Math.round((completedOrders.length / workOrders.length) * 100)
      : 0;

    setText("totalAssets", assets.length);
    setText("activeWorkOrders", activeOrders.length);
    setText("completedWorkOrders", completedOrders.length);
    setText("upcomingMaintenance", upcoming.length);
    setText("completionRate", `${completionRate}%`);
    setText("historyCount", history.length);

    renderRecentActivities();
    renderUpcomingTable(upcoming);
    renderRecentWorkOrders(workOrders);
    renderDashboardCharts(assets, workOrders, history);
  }

  function renderRecentActivities() {
    const list = $("#recentActivities");
    if (!list) {
      return;
    }
    const activities = DB.all("activities")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);

    if (!activities.length) {
      list.innerHTML = `<li class="empty-state">No recent activity yet.</li>`;
      return;
    }

    list.innerHTML = activities
      .map(
        (activity) => `
          <li class="activity-item">
            <span class="activity-icon"></span>
            <span>
              <strong>${escapeHTML(activity.action)}</strong>
              <small>${escapeHTML(activity.detail)} · ${formatDateTime(activity.date)}</small>
            </span>
          </li>
        `
      )
      .join("");
  }

  function renderUpcomingTable(schedules) {
    const body = $("#upcomingMaintenanceTable");
    if (!body) {
      return;
    }
    const rows = schedules
      .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))
      .slice(0, 6);

    body.innerHTML = rows.length
      ? rows
          .map(
            (schedule) => `
              <tr>
                <td>${escapeHTML(assetLabel(schedule.assetId))}</td>
                <td>${escapeHTML(schedule.maintenanceType)}</td>
                <td>${escapeHTML(schedule.frequency)}</td>
                <td>${formatDate(schedule.nextDueDate)}</td>
              </tr>
            `
          )
          .join("")
      : emptyRow(4, "No upcoming maintenance.");
  }

  function renderRecentWorkOrders(workOrders) {
    const body = $("#recentWorkOrdersTable");
    if (!body) {
      return;
    }
    const rows = workOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    body.innerHTML = rows.length
      ? rows
          .map(
            (order) => `
              <tr>
                <td>${escapeHTML(order.workOrderNumber)}</td>
                <td>${escapeHTML(assetLabel(order.assetId))}</td>
                <td>${priorityBadge(order.priority)}</td>
                <td>${badge(order.status)}</td>
                <td>${formatDate(order.dueDate)}</td>
              </tr>
            `
          )
          .join("")
      : emptyRow(5, "No work orders found.");
  }

  function chartColors() {
    return {
      cyan: "#38bdf8",
      blue: "#2563eb",
      green: "#22c55e",
      amber: "#f59e0b",
      red: "#ef4444",
      slate: "#64748b",
      purple: "#8b5cf6",
      grid: "rgba(148, 163, 184, 0.18)",
      text: "#dbeafe"
    };
  }

  function renderDashboardCharts(assets, workOrders, history) {
    if (!window.Chart) {
      $$(".chart-fallback").forEach((item) => {
        item.hidden = false;
      });
      return;
    }

    const colors = chartColors();
    const assetStatus = countBy(assets, "status");
    const workOrderStatus = countBy(workOrders, "status");
    const monthly = monthlyHistoryCounts(history);

    buildChart("assetStatusChart", {
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
      options: doughnutOptions()
    });

    buildChart("workOrderStatusChart", {
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
      options: axisOptions()
    });

    buildChart("monthlyMaintenanceChart", {
      type: "line",
      data: {
        labels: monthly.labels,
        datasets: [
          {
            label: "Completed maintenance",
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
      options: axisOptions()
    });
  }

  function buildChart(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas) {
      return;
    }
    if (charts[id]) {
      charts[id].destroy();
    }
    charts[id] = new window.Chart(canvas, config);
  }

  function doughnutOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#dbeafe",
            boxWidth: 12,
            usePointStyle: true
          }
        }
      },
      cutout: "62%"
    };
  }

  function axisOptions() {
    const colors = chartColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: colors.text,
            boxWidth: 12
          }
        }
      },
      scales: {
        x: {
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        },
        y: {
          ticks: { color: colors.text, precision: 0 },
          grid: { color: colors.grid },
          beginAtZero: true
        }
      }
    };
  }

  function monthlyHistoryCounts(history) {
    const labels = [];
    const values = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      labels.push(
        new Intl.DateTimeFormat("en", {
          month: "short"
        }).format(date)
      );
      values.push(history.filter((item) => String(item.maintenanceDate || "").startsWith(key)).length);
    }
    return { labels, values };
  }

  function init() {
    DB.init();
    setupShell();
    initDashboard();
  }

  window.MaintPro = {
    $,
    $$,
    escapeHTML,
    formatDate,
    formatDateTime,
    badge,
    priorityBadge,
    emptyRow,
    fillSelect,
    showToast,
    openModal,
    closeModal,
    confirm: confirmDialog,
    normalizeClass,
    assetLabel,
    technicianLabel,
    workOrderLabel,
    countBy,
    monthlyHistoryCounts,
    chartColors,
    buildChart,
    doughnutOptions,
    axisOptions
  };

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
