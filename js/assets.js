(function (window, document) {
  "use strict";

  const DB = window.MaintProDB;
  const UI = window.MaintPro;

  function init() {
    if (document.body.dataset.page !== "assets") {
      return;
    }

    UI.$$("[data-action='add-asset']").forEach((button) => {
      button.addEventListener("click", () => openAssetForm());
    });
    UI.$("#assetForm").addEventListener("submit", saveAsset);
    UI.$("#assetsTableBody").addEventListener("click", handleTableClick);
    ["assetSearch", "assetStatusFilter", "assetTypeFilter"].forEach((id) => {
      UI.$(`#${id}`).addEventListener("input", renderAssets);
    });

    hydrateFilters();
    renderAssets();
  }

  function hydrateFilters() {
    const assets = DB.all("assets");
    const types = unique(assets.map((asset) => asset.type)).sort();
    UI.fillSelect(UI.$("#assetStatusFilter"), DB.assetStatuses, "", "All statuses");
    UI.fillSelect(UI.$("#assetTypeFilter"), types, "", "All types");
    UI.fillSelect(UI.$("#assetStatus"), DB.assetStatuses, "Operational", "Select status");
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function filteredAssets() {
    const search = UI.$("#assetSearch").value.trim().toLowerCase();
    const status = UI.$("#assetStatusFilter").value;
    const type = UI.$("#assetTypeFilter").value;

    return DB.all("assets").filter((asset) => {
      const haystack = [
        asset.assetId,
        asset.name,
        asset.type,
        asset.location,
        asset.status,
        asset.installationDate
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesStatus = !status || asset.status === status;
      const matchesType = !type || asset.type === type;
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  function renderAssets() {
    const rows = filteredAssets().sort((a, b) => a.assetId.localeCompare(b.assetId));
    const body = UI.$("#assetsTableBody");
    const count = UI.$("#assetCount");

    count.textContent = `${rows.length} asset${rows.length === 1 ? "" : "s"}`;
    body.innerHTML = rows.length
      ? rows
          .map(
            (asset) => `
              <tr>
                <td><strong>${UI.escapeHTML(asset.assetId)}</strong></td>
                <td>${UI.escapeHTML(asset.name)}</td>
                <td>${UI.escapeHTML(asset.type)}</td>
                <td>${UI.escapeHTML(asset.location)}</td>
                <td>${UI.badge(asset.status)}</td>
                <td>${UI.formatDate(asset.installationDate)}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost" type="button" data-action="edit-asset" data-id="${asset.id}">Edit</button>
                    <button class="btn btn-danger" type="button" data-action="delete-asset" data-id="${asset.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `
          )
          .join("")
      : UI.emptyRow(7, "No assets match the current filters.");
  }

  function openAssetForm(asset) {
    const form = UI.$("#assetForm");
    form.reset();
    UI.fillSelect(UI.$("#assetStatus"), DB.assetStatuses, asset ? asset.status : "Operational", "Select status");

    UI.$("#assetRecordId").value = asset ? asset.id : "";
    UI.$("#assetId").value = asset ? asset.assetId : nextAssetId();
    UI.$("#assetName").value = asset ? asset.name : "";
    UI.$("#assetType").value = asset ? asset.type : "";
    UI.$("#assetLocation").value = asset ? asset.location : "";
    UI.$("#assetInstallationDate").value = asset ? asset.installationDate : DB.todayISO();
    UI.$("#assetModalTitle").textContent = asset ? "Edit Asset" : "Add Asset";
    UI.openModal("assetModal");
  }

  function nextAssetId() {
    const count = DB.all("assets").length + 1;
    return `AST-${String(1000 + count).padStart(4, "0")}`;
  }

  function readForm() {
    return {
      assetId: UI.$("#assetId").value.trim(),
      name: UI.$("#assetName").value.trim(),
      type: UI.$("#assetType").value.trim(),
      location: UI.$("#assetLocation").value.trim(),
      status: UI.$("#assetStatus").value,
      installationDate: UI.$("#assetInstallationDate").value
    };
  }

  function saveAsset(event) {
    event.preventDefault();
    const id = UI.$("#assetRecordId").value;
    const data = readForm();
    const duplicate = DB.all("assets").find(
      (asset) => asset.assetId.toLowerCase() === data.assetId.toLowerCase() && asset.id !== id
    );

    if (duplicate) {
      UI.showToast("Asset ID already exists.", "error");
      return;
    }

    if (id) {
      DB.update("assets", id, data);
      DB.logActivity("Asset updated", `${data.assetId} - ${data.name}`);
      UI.showToast("Asset updated.");
    } else {
      DB.create("assets", data);
      DB.logActivity("Asset added", `${data.assetId} - ${data.name}`);
      UI.showToast("Asset added.");
    }

    UI.closeModal("assetModal");
    hydrateFilters();
    renderAssets();
  }

  async function handleTableClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }

    const asset = DB.get("assets", button.dataset.id);
    if (!asset) {
      return;
    }

    if (button.dataset.action === "edit-asset") {
      openAssetForm(asset);
      return;
    }

    if (button.dataset.action === "delete-asset") {
      const confirmed = await UI.confirm({
        title: "Delete asset",
        message: `Delete ${asset.assetId} - ${asset.name}? Linked records will remain in history and reports.`,
        confirmText: "Delete",
        tone: "danger"
      });
      if (!confirmed) {
        return;
      }
      DB.remove("assets", asset.id);
      DB.logActivity("Asset deleted", `${asset.assetId} - ${asset.name}`);
      UI.showToast("Asset deleted.");
      hydrateFilters();
      renderAssets();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
