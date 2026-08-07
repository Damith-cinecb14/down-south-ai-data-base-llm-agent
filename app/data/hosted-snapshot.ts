import type { DashboardData } from "../types";

// Last verified PostgreSQL export. Used only when the hosted site cannot reach FastAPI.
const storedSnapshot = {
  "connected": false,
  "hospitals": {
    "value": [
      {
        "name": "NATIONAL HOSPITAL - GALLE",
        "address": "Galle, Karapitiya",
        "email": "NA",
        "telephone": "+94 91 2222261",
        "id": 1,
        "created_at": "2026-04-07T21:48:35.439610"
      },
      {
        "name": "GENERAL HOSPITAL - HAMBANTOTA",
        "address": null,
        "email": null,
        "telephone": null,
        "id": 2,
        "created_at": "2026-08-07T22:09:56.717707"
      },
      {
        "name": "GENERAL HOSPITAL - MATARA",
        "address": null,
        "email": null,
        "telephone": null,
        "id": 3,
        "created_at": "2026-08-07T22:09:56.717707"
      }
    ],
    "Count": 3
  },
  "equipment": {
    "value": [
      {
        "hospital_id": 1,
        "name": "ACTINO",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 3,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "ACTIVO",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 4,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "CAPSULA XLII",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 5,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "CR System",
        "model": "PrimaT2",
        "serial_number": "97099107",
        "manufacturer": "fuji",
        "status": "working condition",
        "id": 2,
        "created_at": "2026-04-07T21:48:35.444505"
      },
      {
        "hospital_id": 1,
        "name": "DELTA II LITHOTRIPTER",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 6,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "Digital Mammography ",
        "model": "fuji film Amulet",
        "serial_number": "96522593",
        "manufacturer": "fuji",
        "status": "working condition",
        "id": 1,
        "created_at": "2026-04-07T21:48:35.444505"
      },
      {
        "hospital_id": 1,
        "name": "DRYPIX EDGE",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 7,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "DRYPIX SMART",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 8,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "MAMOGRAPHY",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 9,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "MOBILE DART",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 10,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "MUX 10",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 11,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "PRIMA T2",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 12,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "RADSPEED MC",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 13,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "RADSPEED MF - DR",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 14,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "SONIAL VISION G4",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 15,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 1,
        "name": "US-FAZONE",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 16,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 2,
        "name": "DENTAL X-RAY",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 17,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 2,
        "name": "MUX 10",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 18,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 2,
        "name": "PRIMA T2",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 19,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 2,
        "name": "RADSPEED MF - DR",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 20,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 2,
        "name": "US-FAZONE",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 21,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 3,
        "name": "MOBILE DART",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 22,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 3,
        "name": "MUX 10",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 23,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 3,
        "name": "RADSPEED MC",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 24,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 3,
        "name": "RADSPEED MF - DR",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 25,
        "created_at": "2026-08-07T22:12:07.603288"
      },
      {
        "hospital_id": 3,
        "name": "US-FAZONE",
        "model": null,
        "serial_number": null,
        "manufacturer": null,
        "status": null,
        "id": 26,
        "created_at": "2026-08-07T22:12:07.603288"
      }
    ],
    "Count": 26
  },
  "services": {
    "value": [
      {
        "equipment_id": 1,
        "service_year": 2026,
        "quarter": 4,
        "service_date": "05february2026",
        "engineer_name": "Damith",
        "status": "working condition",
        "remarks": "report pending",
        "id": 2,
        "created_at": "2026-04-07T21:48:35.445709"
      },
      {
        "equipment_id": 1,
        "service_year": 2025,
        "quarter": 3,
        "service_date": "05 november 2025",
        "engineer_name": "Damith",
        "status": "working condition",
        "remarks": "report pending",
        "id": 1,
        "created_at": "2026-04-07T21:48:35.445709"
      }
    ],
    "Count": 2
  },
  "agreements": {
    "value": [
      {
        "id": 19,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "SONIAL VISION G4",
        "installation_date": "2022-01-24",
        "contract_number": "BES/FF/2023/07",
        "provider_type": "BES",
        "agreement_start_date": "2025-02-04",
        "agreement_end_date": "2026-02-03",
        "source_row": 21
      },
      {
        "id": 5,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "RADSPEED MC",
        "installation_date": "2011-04-06",
        "contract_number": "BES/FM/2014/06",
        "provider_type": "BES",
        "agreement_start_date": "2025-03-08",
        "agreement_end_date": "2026-03-07",
        "source_row": 7
      },
      {
        "id": 28,
        "hospital_name": "GENERAL HOSPITAL - HAMBANTOTA",
        "equipment_name": "US-FAZONE",
        "installation_date": "2015-04-01",
        "contract_number": "BES/FH/2016/02",
        "provider_type": "BES",
        "agreement_start_date": "2025-03-13",
        "agreement_end_date": "2026-03-12",
        "source_row": 30
      },
      {
        "id": 25,
        "hospital_name": "GENERAL HOSPITAL - HAMBANTOTA",
        "equipment_name": "US-FAZONE",
        "installation_date": "2015-04-01",
        "contract_number": "BES/FH/2016/02",
        "provider_type": "BES",
        "agreement_start_date": "2025-03-13",
        "agreement_end_date": "2026-03-12",
        "source_row": 27
      },
      {
        "id": 30,
        "hospital_name": "GENERAL HOSPITAL - MATARA",
        "equipment_name": "US-FAZONE",
        "installation_date": "2015-03-31",
        "contract_number": "BES/FH/2016/02",
        "provider_type": "BES",
        "agreement_start_date": "2025-03-13",
        "agreement_end_date": "2026-03-12",
        "source_row": 32
      },
      {
        "id": 34,
        "hospital_name": "GENERAL HOSPITAL - MATARA",
        "equipment_name": "US-FAZONE",
        "installation_date": "2015-03-31",
        "contract_number": "BES/FH/2016/02",
        "provider_type": "BES",
        "agreement_start_date": "2025-03-13",
        "agreement_end_date": "2026-03-12",
        "source_row": 36
      },
      {
        "id": 14,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "US-FAZONE",
        "installation_date": "2015-03-18",
        "contract_number": "BES/FH/2016/02",
        "provider_type": "BES",
        "agreement_start_date": "2025-03-13",
        "agreement_end_date": "2026-03-12",
        "source_row": 16
      },
      {
        "id": 2,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "US-FAZONE",
        "installation_date": "2015-04-28",
        "contract_number": "BES/FH/2016/02",
        "provider_type": "BES",
        "agreement_start_date": "2025-03-13",
        "agreement_end_date": "2026-03-12",
        "source_row": 4
      },
      {
        "id": 31,
        "hospital_name": "GENERAL HOSPITAL - MATARA",
        "equipment_name": "MUX 10",
        "installation_date": "2013-04-08",
        "contract_number": "BES/FM/2013/51",
        "provider_type": "BES",
        "agreement_start_date": "2025-04-09",
        "agreement_end_date": "2026-04-08",
        "source_row": 33
      },
      {
        "id": 27,
        "hospital_name": "GENERAL HOSPITAL - HAMBANTOTA",
        "equipment_name": "RADSPEED MF - DR",
        "installation_date": "2018-11-30",
        "contract_number": "BES/FC/SA/2021/23",
        "provider_type": "BES",
        "agreement_start_date": "2025-04-23",
        "agreement_end_date": "2026-04-22",
        "source_row": 29
      },
      {
        "id": 33,
        "hospital_name": "GENERAL HOSPITAL - MATARA",
        "equipment_name": "RADSPEED MF - DR",
        "installation_date": "2018-12-07",
        "contract_number": "BES/FC/SA/2021/23",
        "provider_type": "BES",
        "agreement_start_date": "2025-04-23",
        "agreement_end_date": "2026-04-22",
        "source_row": 35
      },
      {
        "id": 13,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "RADSPEED MF - DR",
        "installation_date": "2020-01-15",
        "contract_number": "BES/FC/SA/2021/23",
        "provider_type": "BES",
        "agreement_start_date": "2025-04-23",
        "agreement_end_date": "2026-04-22",
        "source_row": 15
      },
      {
        "id": 18,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "DELTA II LITHOTRIPTER",
        "installation_date": "2016-06-27",
        "contract_number": "BES/FC/SA/2017/08",
        "provider_type": "BES",
        "agreement_start_date": "2025-06-27",
        "agreement_end_date": "2026-06-26",
        "source_row": 20
      },
      {
        "id": 1,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "RADSPEED MC",
        "installation_date": "2011-11-18",
        "contract_number": "BES/FG/SA/2012/57",
        "provider_type": "BES",
        "agreement_start_date": "2025-08-17",
        "agreement_end_date": "2026-08-16",
        "source_row": 3
      },
      {
        "id": 35,
        "hospital_name": "GENERAL HOSPITAL - MATARA",
        "equipment_name": "MOBILE DART",
        "installation_date": "2021-05-12",
        "contract_number": "BES/FH/2025/01",
        "provider_type": "BES",
        "agreement_start_date": "2025-08-18",
        "agreement_end_date": "2026-08-17",
        "source_row": 37
      },
      {
        "id": 10,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "ACTIVO",
        "installation_date": "2014-08-13",
        "contract_number": "BES/FM/2015/03",
        "provider_type": "BES",
        "agreement_start_date": "2025-08-13",
        "agreement_end_date": "2026-08-17",
        "source_row": 12
      },
      {
        "id": 17,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "MOBILE DART",
        "installation_date": "2021-05-12",
        "contract_number": "BES/FH/2025/01",
        "provider_type": "BES",
        "agreement_start_date": "2025-08-18",
        "agreement_end_date": "2026-08-17",
        "source_row": 19
      },
      {
        "id": 20,
        "hospital_name": "GENERAL HOSPITAL - HAMBANTOTA",
        "equipment_name": "DENTAL X-RAY",
        "installation_date": "2019-08-30",
        "contract_number": "BES/FC/SA/2021/36",
        "provider_type": "BES",
        "agreement_start_date": "2025-09-01",
        "agreement_end_date": "2026-08-31",
        "source_row": 22
      },
      {
        "id": 16,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "DRYPIX EDGE",
        "installation_date": "2020-10-10",
        "contract_number": "BES/PB/PLAN/2019/07",
        "provider_type": "BES",
        "agreement_start_date": "2025-09-01",
        "agreement_end_date": "2026-08-31",
        "source_row": 18
      },
      {
        "id": 15,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "PRIMA T2",
        "installation_date": "2020-10-10",
        "contract_number": "BES/PB/PLAN/2019/07",
        "provider_type": "BES",
        "agreement_start_date": "2025-09-01",
        "agreement_end_date": "2026-08-31",
        "source_row": 17
      },
      {
        "id": 3,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "ACTIVO",
        "installation_date": "2013-09-12",
        "contract_number": "BES/FM/2013/30",
        "provider_type": "BES",
        "agreement_start_date": "2025-09-18",
        "agreement_end_date": "2026-09-17",
        "source_row": 5
      },
      {
        "id": 12,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "DRYPIX SMART",
        "installation_date": "2020-06-26",
        "contract_number": "BES/FF/2022/26",
        "provider_type": "BES",
        "agreement_start_date": "2025-10-03",
        "agreement_end_date": "2026-10-02",
        "source_row": 14
      },
      {
        "id": 11,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "MAMOGRAPHY",
        "installation_date": "2020-06-26",
        "contract_number": "BES/FF/2022/26",
        "provider_type": "BES",
        "agreement_start_date": "2025-10-03",
        "agreement_end_date": "2026-10-02",
        "source_row": 13
      },
      {
        "id": 24,
        "hospital_name": "GENERAL HOSPITAL - HAMBANTOTA",
        "equipment_name": "MUX 10",
        "installation_date": "2019-11-26",
        "contract_number": "BES/FG/SA/2022/13",
        "provider_type": "BES",
        "agreement_start_date": "2025-11-26",
        "agreement_end_date": "2026-11-24",
        "source_row": 26
      },
      {
        "id": 23,
        "hospital_name": "GENERAL HOSPITAL - HAMBANTOTA",
        "equipment_name": "MUX 10",
        "installation_date": "2019-11-26",
        "contract_number": "BES/FG/SA/2022/13",
        "provider_type": "BES",
        "agreement_start_date": "2025-11-26",
        "agreement_end_date": "2026-11-24",
        "source_row": 25
      },
      {
        "id": 21,
        "hospital_name": "GENERAL HOSPITAL - HAMBANTOTA",
        "equipment_name": "PRIMA T2",
        "installation_date": "2019-08-30",
        "contract_number": "BES/FG/SA/2022/13",
        "provider_type": "BES",
        "agreement_start_date": "2025-11-26",
        "agreement_end_date": "2026-11-24",
        "source_row": 23
      },
      {
        "id": 29,
        "hospital_name": "GENERAL HOSPITAL - MATARA",
        "equipment_name": "RADSPEED MC",
        "installation_date": "2017-08-16",
        "contract_number": "BES/FI/2019/09",
        "provider_type": "BES",
        "agreement_start_date": "2025-12-21",
        "agreement_end_date": "2026-12-20",
        "source_row": 31
      },
      {
        "id": 4,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "CAPSULA XLII",
        "installation_date": "2012-12-11",
        "contract_number": "BES/FI/2013/09",
        "provider_type": "BES",
        "agreement_start_date": "2025-12-22",
        "agreement_end_date": "2026-12-21",
        "source_row": 6
      },
      {
        "id": 6,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "ACTINO",
        "installation_date": "2017-10-02",
        "contract_number": "BES/FM/2021/01",
        "provider_type": "BES",
        "agreement_start_date": "2025-12-30",
        "agreement_end_date": "2026-12-29",
        "source_row": 8
      },
      {
        "id": 26,
        "hospital_name": "GENERAL HOSPITAL - HAMBANTOTA",
        "equipment_name": "MUX 10",
        "installation_date": "2018-11-30",
        "contract_number": "BES/FC/SA/2020/09",
        "provider_type": "BES",
        "agreement_start_date": "2026-01-04",
        "agreement_end_date": "2027-01-03",
        "source_row": 28
      },
      {
        "id": 32,
        "hospital_name": "GENERAL HOSPITAL - MATARA",
        "equipment_name": "MUX 10",
        "installation_date": "2016-11-30",
        "contract_number": "BES/FC/SA/2017/17",
        "provider_type": "BES",
        "agreement_start_date": "2026-01-18",
        "agreement_end_date": "2027-01-17",
        "source_row": 34
      },
      {
        "id": 7,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "MUX 10",
        "installation_date": "2016-06-29",
        "contract_number": "BES/FC/SA/2017/17",
        "provider_type": "BES",
        "agreement_start_date": "2026-01-18",
        "agreement_end_date": "2027-01-17",
        "source_row": 9
      },
      {
        "id": 8,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "MUX 10",
        "installation_date": "2016-06-29",
        "contract_number": "BES/FC/SA/2017/17",
        "provider_type": "BES",
        "agreement_start_date": "2026-01-18",
        "agreement_end_date": "2027-01-17",
        "source_row": 10
      },
      {
        "id": 9,
        "hospital_name": "NATIONAL HOSPITAL - GALLE",
        "equipment_name": "MUX 10",
        "installation_date": "2016-06-29",
        "contract_number": "BES/FC/SA/2017/17",
        "provider_type": "BES",
        "agreement_start_date": "2026-01-18",
        "agreement_end_date": "2027-01-17",
        "source_row": 11
      },
      {
        "id": 22,
        "hospital_name": "GENERAL HOSPITAL - HAMBANTOTA",
        "equipment_name": "MUX 10",
        "installation_date": "2019-11-26",
        "contract_number": "BES/FG/SA/2022/14",
        "provider_type": "BES",
        "agreement_start_date": null,
        "agreement_end_date": null,
        "source_row": 24
      }
    ],
    "Count": 35
  }
};

export const hostedSnapshot: DashboardData = {
  connected: false,
  hospitals: storedSnapshot.hospitals.value,
  equipment: storedSnapshot.equipment.value,
  services: storedSnapshot.services.value,
  agreements: storedSnapshot.agreements.value,
};
