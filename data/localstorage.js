(function (window) {
  "use strict";

  const APP_KEY = "maintpro360";
  const VERSION = "1.0.0";
  const VERSION_KEY = `${APP_KEY}.version`;

  const COLLECTIONS = [
    "assets",
    "technicians",
    "schedules",
    "workOrders",
    "maintenanceHistory",
    "activities"
  ];

  const PREFIXES = {
    assets: "AST",
    technicians: "TECH",
    schedules: "SCH",
    workOrders: "WO",
    maintenanceHistory: "MH",
    activities: "ACT"
  };

  const seedData = {
    assets: [
      {
        id: "asset-001",
        assetId: "AST-1001",
        name: "Crude Transfer Pump A",
        type: "Pump",
        location: "Flow Station 2",
        status: "Operational",
        installationDate: "2021-03-18",
        createdAt: "2026-01-05T09:00:00.000Z",
        updatedAt: "2026-01-05T09:00:00.000Z"
      },
      {
        id: "asset-002",
        assetId: "AST-1002",
        name: "Gas Compressor Unit 4",
        type: "Compressor",
        location: "Gas Plant",
        status: "Maintenance",
        installationDate: "2020-11-02",
        createdAt: "2026-01-05T09:10:00.000Z",
        updatedAt: "2026-01-05T09:10:00.000Z"
      },
      {
        id: "asset-003",
        assetId: "AST-1003",
        name: "Separator Vessel V-12",
        type: "Vessel",
        location: "Production Manifold",
        status: "Operational",
        installationDate: "2019-07-22",
        createdAt: "2026-01-05T09:20:00.000Z",
        updatedAt: "2026-01-05T09:20:00.000Z"
      },
      {
        id: "asset-004",
        assetId: "AST-1004",
        name: "Fire Water Pump B",
        type: "Pump",
        location: "Utility Area",
        status: "Operational",
        installationDate: "2022-02-14",
        createdAt: "2026-01-05T09:30:00.000Z",
        updatedAt: "2026-01-05T09:30:00.000Z"
      },
      {
        id: "asset-005",
        assetId: "AST-1005",
        name: "Control Valve CV-208",
        type: "Valve",
        location: "Export Line",
        status: "Offline",
        installationDate: "2023-09-08",
        createdAt: "2026-01-05T09:40:00.000Z",
        updatedAt: "2026-01-05T09:40:00.000Z"
      },
      {
        id: "asset-006",
        assetId: "AST-1006",
        name: "Diesel Generator DG-03",
        type: "Generator",
        location: "Power House",
        status: "Operational",
        installationDate: "2018-05-30",
        createdAt: "2026-01-05T09:50:00.000Z",
        updatedAt: "2026-01-05T09:50:00.000Z"
      }
    ],
    technicians: [
      {
        id: "tech-001",
        employeeId: "EMP-410",
        name: "Ada Okafor",
        skill: "Mechanical",
        department: "Maintenance",
        phone: "+234 800 100 2010",
        createdAt: "2026-01-05T10:00:00.000Z",
        updatedAt: "2026-01-05T10:00:00.000Z"
      },
      {
        id: "tech-002",
        employeeId: "EMP-411",
        name: "Daniel Musa",
        skill: "Instrumentation",
        department: "Controls",
        phone: "+234 800 100 2011",
        createdAt: "2026-01-05T10:10:00.000Z",
        updatedAt: "2026-01-05T10:10:00.000Z"
      },
      {
        id: "tech-003",
        employeeId: "EMP-412",
        name: "Tari Ebi",
        skill: "Electrical",
        department: "Utilities",
        phone: "+234 800 100 2012",
        createdAt: "2026-01-05T10:20:00.000Z",
        updatedAt: "2026-01-05T10:20:00.000Z"
      },
      {
        id: "tech-004",
        employeeId: "EMP-413",
        name: "Ngozi Bello",
        skill: "Reliability",
        department: "Asset Integrity",
        phone: "+234 800 100 2013",
        createdAt: "2026-01-05T10:30:00.000Z",
        updatedAt: "2026-01-05T10:30:00.000Z"
      }
    ],
    schedules: [
      {
        id: "schedule-001",
        assetId: "asset-001",
        frequency: "Monthly",
        startDate: "2026-05-20",
        nextDueDate: "2026-06-20",
        maintenanceType: "Lubrication and seal inspection",
        createdAt: "2026-05-10T08:00:00.000Z",
        updatedAt: "2026-05-10T08:00:00.000Z"
      },
      {
        id: "schedule-002",
        assetId: "asset-002",
        frequency: "Weekly",
        startDate: "2026-06-10",
        nextDueDate: "2026-06-17",
        maintenanceType: "Vibration and lube oil checks",
        createdAt: "2026-05-10T08:10:00.000Z",
        updatedAt: "2026-05-10T08:10:00.000Z"
      },
      {
        id: "schedule-003",
        assetId: "asset-003",
        frequency: "Quarterly",
        startDate: "2026-04-01",
        nextDueDate: "2026-07-01",
        maintenanceType: "Internal inspection readiness",
        createdAt: "2026-05-10T08:20:00.000Z",
        updatedAt: "2026-05-10T08:20:00.000Z"
      },
      {
        id: "schedule-004",
        assetId: "asset-004",
        frequency: "Monthly",
        startDate: "2026-06-02",
        nextDueDate: "2026-07-02",
        maintenanceType: "Emergency pump run test",
        createdAt: "2026-05-10T08:30:00.000Z",
        updatedAt: "2026-05-10T08:30:00.000Z"
      },
      {
        id: "schedule-005",
        assetId: "asset-006",
        frequency: "Biweekly",
        startDate: "2026-06-01",
        nextDueDate: "2026-06-15",
        maintenanceType: "Load bank readiness check",
        createdAt: "2026-05-10T08:40:00.000Z",
        updatedAt: "2026-05-10T08:40:00.000Z"
      }
    ],
    workOrders: [
      {
        id: "workorder-001",
        workOrderNumber: "WO-2026-0001",
        assetId: "asset-002",
        description: "Investigate high discharge temperature alarm on compressor.",
        priority: "Critical",
        technicianId: "tech-002",
        status: "In Progress",
        dateCreated: "2026-06-11",
        dueDate: "2026-06-14",
        createdAt: "2026-06-11T07:30:00.000Z",
        updatedAt: "2026-06-12T09:00:00.000Z"
      },
      {
        id: "workorder-002",
        workOrderNumber: "WO-2026-0002",
        assetId: "asset-005",
        description: "Replace faulty valve positioner and recalibrate loop.",
        priority: "High",
        technicianId: "tech-002",
        status: "Open",
        dateCreated: "2026-06-12",
        dueDate: "2026-06-16",
        createdAt: "2026-06-12T10:30:00.000Z",
        updatedAt: "2026-06-12T10:30:00.000Z"
      },
      {
        id: "workorder-003",
        workOrderNumber: "WO-2026-0003",
        assetId: "asset-004",
        description: "Monthly fire water pump performance test.",
        priority: "Medium",
        technicianId: "tech-001",
        status: "Completed",
        dateCreated: "2026-06-03",
        dueDate: "2026-06-07",
        createdAt: "2026-06-03T08:15:00.000Z",
        updatedAt: "2026-06-07T12:00:00.000Z"
      },
      {
        id: "workorder-004",
        workOrderNumber: "WO-2026-0004",
        assetId: "asset-006",
        description: "Inspect generator coolant leak at radiator hose.",
        priority: "Medium",
        technicianId: "tech-003",
        status: "On Hold",
        dateCreated: "2026-06-08",
        dueDate: "2026-06-18",
        createdAt: "2026-06-08T13:00:00.000Z",
        updatedAt: "2026-06-09T10:00:00.000Z"
      },
      {
        id: "workorder-005",
        workOrderNumber: "WO-2026-0005",
        assetId: "asset-001",
        description: "Check pump coupling alignment after vibration trend rise.",
        priority: "High",
        technicianId: "tech-001",
        status: "Open",
        dateCreated: "2026-06-13",
        dueDate: "2026-06-19",
        createdAt: "2026-06-13T09:45:00.000Z",
        updatedAt: "2026-06-13T09:45:00.000Z"
      }
    ],
    maintenanceHistory: [
      {
        id: "history-001",
        assetId: "asset-004",
        workOrderId: "workorder-003",
        technicianId: "tech-001",
        maintenanceType: "Monthly pump test",
        maintenanceDate: "2026-06-07",
        notes: "Pump met flow and pressure targets. No vibration abnormality observed.",
        createdAt: "2026-06-07T12:00:00.000Z",
        updatedAt: "2026-06-07T12:00:00.000Z"
      },
      {
        id: "history-002",
        assetId: "asset-001",
        workOrderId: "",
        technicianId: "tech-004",
        maintenanceType: "Routine inspection",
        maintenanceDate: "2026-05-20",
        notes: "Seal pot level adjusted and bearing temperature trend reviewed.",
        createdAt: "2026-05-20T11:00:00.000Z",
        updatedAt: "2026-05-20T11:00:00.000Z"
      },
      {
        id: "history-003",
        assetId: "asset-006",
        workOrderId: "",
        technicianId: "tech-003",
        maintenanceType: "Generator readiness check",
        maintenanceDate: "2026-06-01",
        notes: "Battery charger voltage corrected. Unit started successfully.",
        createdAt: "2026-06-01T10:30:00.000Z",
        updatedAt: "2026-06-01T10:30:00.000Z"
      },
      {
        id: "history-004",
        assetId: "asset-003",
        workOrderId: "",
        technicianId: "tech-004",
        maintenanceType: "External vessel inspection",
        maintenanceDate: "2026-04-01",
        notes: "No external corrosion found. PSV tags verified.",
        createdAt: "2026-04-01T14:10:00.000Z",
        updatedAt: "2026-04-01T14:10:00.000Z"
      }
    ],
    activities: [
      {
        id: "activity-001",
        action: "Work order updated",
        detail: "WO-2026-0001 moved to In Progress",
        date: "2026-06-12T09:00:00.000Z",
        createdAt: "2026-06-12T09:00:00.000Z",
        updatedAt: "2026-06-12T09:00:00.000Z"
      },
      {
        id: "activity-002",
        action: "Maintenance completed",
        detail: "Fire Water Pump B monthly test recorded",
        date: "2026-06-07T12:00:00.000Z",
        createdAt: "2026-06-07T12:00:00.000Z",
        updatedAt: "2026-06-07T12:00:00.000Z"
      },
      {
        id: "activity-003",
        action: "Schedule created",
        detail: "Gas Compressor Unit 4 weekly inspection added",
        date: "2026-05-10T08:10:00.000Z",
        createdAt: "2026-05-10T08:10:00.000Z",
        updatedAt: "2026-05-10T08:10:00.000Z"
      },
      {
        id: "activity-004",
        action: "Asset added",
        detail: "Diesel Generator DG-03 registered",
        date: "2026-01-05T09:50:00.000Z",
        createdAt: "2026-01-05T09:50:00.000Z",
        updatedAt: "2026-01-05T09:50:00.000Z"
      }
    ]
  };

  function storageKey(collection) {
    return `${APP_KEY}.${collection}`;
  }

  function now() {
    return new Date().toISOString();
  }

  function todayISO() {
    return toISODate(new Date());
  }

  function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function read(collection) {
    try {
      const raw = window.localStorage.getItem(storageKey(collection));
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn(`MaintPro360 could not read ${collection}.`, error);
      return [];
    }
  }

  function write(collection, records) {
    window.localStorage.setItem(storageKey(collection), JSON.stringify(records));
  }

  function makeId(collection) {
    const prefix = PREFIXES[collection] || "MP";
    return `${prefix}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
  }

  function ensureCollection(collection) {
    if (!COLLECTIONS.includes(collection)) {
      throw new Error(`Unknown MaintPro360 collection: ${collection}`);
    }
  }

  function seed(force) {
    const hasVersion = Boolean(window.localStorage.getItem(VERSION_KEY));
    if (!force && hasVersion) {
      COLLECTIONS.forEach((collection) => {
        if (!window.localStorage.getItem(storageKey(collection))) {
          write(collection, []);
        }
      });
      return;
    }

    COLLECTIONS.forEach((collection) => {
      write(collection, seedData[collection] || []);
    });
    window.localStorage.setItem(VERSION_KEY, VERSION);
  }

  function all(collection) {
    ensureCollection(collection);
    return read(collection);
  }

  function get(collection, id) {
    ensureCollection(collection);
    return read(collection).find((record) => record.id === id) || null;
  }

  function create(collection, record) {
    ensureCollection(collection);
    const timestamp = now();
    const records = read(collection);
    const item = {
      ...record,
      id: record.id || makeId(collection),
      createdAt: record.createdAt || timestamp,
      updatedAt: timestamp
    };
    records.push(item);
    write(collection, records);
    return item;
  }

  function update(collection, id, changes) {
    ensureCollection(collection);
    const timestamp = now();
    let updated = null;
    const records = read(collection).map((record) => {
      if (record.id !== id) {
        return record;
      }
      updated = {
        ...record,
        ...changes,
        id,
        updatedAt: timestamp
      };
      return updated;
    });
    write(collection, records);
    return updated;
  }

  function remove(collection, id) {
    ensureCollection(collection);
    const records = read(collection);
    const nextRecords = records.filter((record) => record.id !== id);
    write(collection, nextRecords);
    return records.length !== nextRecords.length;
  }

  function saveAll(collection, records) {
    ensureCollection(collection);
    write(collection, records);
  }

  function addDays(date, days) {
    const next = new Date(date.getTime());
    next.setDate(next.getDate() + days);
    return next;
  }

  function addMonths(date, months) {
    const next = new Date(date.getTime());
    next.setMonth(next.getMonth() + months);
    return next;
  }

  function calculateNextDue(baseDate, frequency) {
    if (!baseDate || !frequency) {
      return "";
    }

    const date = new Date(`${baseDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const map = {
      Daily: () => addDays(date, 1),
      Weekly: () => addDays(date, 7),
      Biweekly: () => addDays(date, 14),
      Monthly: () => addMonths(date, 1),
      Quarterly: () => addMonths(date, 3),
      "Semi-Annual": () => addMonths(date, 6),
      Annual: () => addMonths(date, 12)
    };

    const next = map[frequency] ? map[frequency]() : addMonths(date, 1);
    return toISODate(next);
  }

  function calculateRollingNextDue(startDate, frequency) {
    let next = calculateNextDue(startDate, frequency);
    let guard = 0;
    while (next && next < todayISO() && guard < 60) {
      next = calculateNextDue(next, frequency);
      guard += 1;
    }
    return next;
  }

  function logActivity(action, detail) {
    return create("activities", {
      action,
      detail,
      date: now()
    });
  }

  function nextWorkOrderNumber() {
    const year = new Date().getFullYear();
    const count = read("workOrders").filter((order) =>
      String(order.workOrderNumber || "").includes(`WO-${year}-`)
    ).length;
    return `WO-${year}-${String(count + 1).padStart(4, "0")}`;
  }

  window.MaintProDB = {
    collections: COLLECTIONS,
    frequencies: [
      "Daily",
      "Weekly",
      "Biweekly",
      "Monthly",
      "Quarterly",
      "Semi-Annual",
      "Annual"
    ],
    assetStatuses: ["Operational", "Maintenance", "Offline", "Decommissioned"],
    workOrderStatuses: ["Open", "In Progress", "On Hold", "Completed", "Cancelled"],
    priorities: ["Critical", "High", "Medium", "Low"],
    init: () => seed(false),
    reset: () => seed(true),
    all,
    get,
    create,
    update,
    remove,
    saveAll,
    logActivity,
    makeId,
    todayISO,
    calculateNextDue,
    calculateRollingNextDue,
    nextWorkOrderNumber
  };
})(window);
