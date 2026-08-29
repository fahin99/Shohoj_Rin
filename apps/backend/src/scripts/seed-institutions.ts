import { pool } from "../lib/db.js";

const STATIC_BANGLADESH_INSTITUTIONS = [
  { name: "University of Dhaka", type: "university" },
  { name: "Bangladesh University of Engineering and Technology (BUET)", type: "university" },
  { name: "Dhaka University of Engineering and Technology (DUET)", type: "university" },
  { name: "Jahangirnagar University", type: "university" },
  { name: "Rajshahi University", type: "university" },
  { name: "University of Chittagong", type: "university" },
  { name: "Jatiya Kabi Kazi Nazrul Islam University", type: "university" },
  { name: "Khulna University", type: "university" },
  { name: "Begum Rokeya University, Rangpur", type: "university" },
  { name: "Dhaka Medical College", type: "university" },
  { name: "Bangladesh Open University", type: "university" },
  { name: "Sir Salimullah Medical College", type: "university" },
  { name: "Suhrawardy Medical College", type: "university" },
  { name: "Chittagong Medical College", type: "university" },
  { name: "Rajshahi Medical College", type: "university" },
  { name: "Mymensingh Medical College", type: "university" },
  { name: "Sher-e-Bangla Medical College", type: "university" },
  { name: "Sylhet MAG Osmani Medical College", type: "university" },
  { name: "Bangabandhu Sheikh Mujib Medical University (BSMMU)", type: "university" },
  { name: "Mugda Medical College", type: "university" },
  { name: "Shahjalal University of Science and Technology (SUST)", type: "university" },
  { name: "Khulna University of Engineering & Technology (KUET)", type: "university" },
  { name: "Chittagong University of Engineering & Technology (CUET)", type: "university" },
  { name: "Rajshahi University of Engineering & Technology (RUET)", type: "university" },
  { name: "Islamic University of Technology (IUT)", type: "university" },
  { name: "Bangladesh University of Textiles (BUTEX)", type: "university" },
  { name: "Military Institute of Science and Technology (MIST)", type: "university" },
  { name: "Bangladesh Agricultural University", type: "university" },
  { name: "Bangladesh University of Professionals (BUP)", type: "university" },
  { name: "North South University (NSU)", type: "university" },
  { name: "BRAC University", type: "university" },
  { name: "Independent University, Bangladesh (IUB)", type: "university" },
  { name: "American International University-Bangladesh (AIUB)", type: "university" },
  { name: "East West University (EWU)", type: "university" },
  { name: "United International University (UIU)", type: "university" },
  { name: "Daffodil International University (DIU)", type: "university" },
  { name: "Ahsanullah University of Science and Technology (AUST)", type: "university" },
  { name: "University of Liberal Arts Bangladesh (ULAB)", type: "university" },
  { name: "Southeast University", type: "university" },
  { name: "Stamford University Bangladesh", type: "university" },
  { name: "Green University of Bangladesh", type: "university" },
  { name: "International Islamic University Chittagong (IIUC)", type: "university" },
  { name: "Comilla University", type: "university" },
  { name: "Begum Rokeya University, Rangpur", type: "university" },
  { name: "National University", type: "university" },
  { name: "Bangladesh Open University", type: "university" },
  { name: "Jagannath University", type: "university" },
  { name: "Patuakhali Science and Technology University", type: "university" },
  { name: "Hajee Mohammad Danesh Science and Technology University", type: "university" },
  { name: "Mawlana Bhashani Science and Technology University", type: "university" },
  { name: "Noakhali Science and Technology University", type: "university" },
  { name: "Jatiya Kabi Kazi Nazrul Islam University", type: "university" },
  {
    name: "Bangabandhu Sheikh Mujibur Rahman Science and Technology University",
    type: "university",
  },
  { name: "Dhaka College", type: "college" },
  { name: "Notre Dame College", type: "college" },
  { name: "Holy Cross College", type: "college" },
  { name: "Rajuk Uttara Model College", type: "college" },
  { name: "Viqarunnisa Noon College", type: "college" },
  { name: "Adamjee Cantonment College", type: "college" },
  { name: "Dhaka City College", type: "college" },
  { name: "Government Science College", type: "college" },
  { name: "Residential Model College", type: "college" },
  { name: "Chittagong College", type: "college" },
  { name: "Government Hazi Mohammad Mohsin College", type: "college" },
  { name: "Rajshahi College", type: "college" },
  { name: "Murari Chand (MC) College, Sylhet", type: "college" },
  { name: "Government Brojomohun (BM) College, Barisal", type: "college" },
  { name: "Carmichael College, Rangpur", type: "college" },
  { name: "Government Azizul Haque College, Bogura", type: "college" },
  { name: "Comilla Victoria Government College", type: "college" },
  { name: "Government Saadat College, Tangail", type: "college" },
  { name: "Govt. Edward College, Pabna", type: "college" },
  { name: "Sir Ashutosh Government College, Chattogram", type: "college" },
  { name: "Ananda Mohan College, Mymensingh", type: "college" },
];

const JSON_DATA_ENDPOINTS = {
  colleges: "https://bd-institution-data.solutya.com/data/bd_collegeName_data.json",
  publicUnis: "https://bd-institution-data.solutya.com/data/public_Uni_data.json",
  privateUnis: "https://bd-institution-data.solutya.com/data/private_Uni_data.json",
  nuUnis: "https://bd-institution-data.solutya.com/data/nu_Uni_data.json",
};

async function fetchJsonArray(url: string): Promise<any[]> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function loadRemoteInstitutions(): Promise<{ colleges: any[]; universities: any[] }> {
  try {
    const [colleges, publicUnis, privateUnis, nuUnis] = await Promise.all([
      fetchJsonArray(JSON_DATA_ENDPOINTS.colleges),
      fetchJsonArray(JSON_DATA_ENDPOINTS.publicUnis),
      fetchJsonArray(JSON_DATA_ENDPOINTS.privateUnis),
      fetchJsonArray(JSON_DATA_ENDPOINTS.nuUnis),
    ]);

    return {
      colleges,
      universities: [...publicUnis, ...privateUnis, ...nuUnis],
    };
  } catch (err) {
    console.warn("Notice: Could not fetch remote JSON datasets, falling back to static list.");
    return { colleges: [], universities: [] };
  }
}

async function seedInstitutions() {
  const client = await pool.connect();
  try {
    console.log("Starting institution seeding...");
    const { colleges, universities } = await loadRemoteInstitutions();
    const institutionMap = new Map<string, { name: string; type: string; is_verified: boolean }>();

    // 1. Static Institutions
    for (const inst of STATIC_BANGLADESH_INSTITUTIONS) {
      const normName = inst.name.trim();
      institutionMap.set(normName.toLowerCase(), {
        name: normName,
        type: inst.type,
        is_verified: true,
      });
    }

    // 2. Colleges from JSON
    for (const c of colleges) {
      const name = (typeof c === "string" ? c : c?.name)?.trim();
      if (name && !institutionMap.has(name.toLowerCase())) {
        institutionMap.set(name.toLowerCase(), {
          name,
          type: "college",
          is_verified: true,
        });
      }
    }

    // 3. Universities from JSON
    for (const u of universities) {
      const name = (typeof u === "string" ? u : u?.name)?.trim();
      if (name && !institutionMap.has(name.toLowerCase())) {
        institutionMap.set(name.toLowerCase(), {
          name,
          type: "university",
          is_verified: true,
        });
      }
    }

    const uniqueInstitutions = Array.from(institutionMap.values());
    console.log(`Prepared ${uniqueInstitutions.length} institutions for bulk upsert.`);

    let insertedCount = 0;
    const batchSize = 100;
    for (let i = 0; i < uniqueInstitutions.length; i += batchSize) {
      const batch = uniqueInstitutions.slice(i, i + batchSize);
      const valueClauses: string[] = [];
      const queryParams: any[] = [];

      batch.forEach((inst, index) => {
        const offset = index * 3;
        valueClauses.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
        queryParams.push(inst.name, inst.type, inst.is_verified);
      });

      if (valueClauses.length > 0) {
        const query = `
          INSERT INTO institutions (name, type, is_verified)
          VALUES ${valueClauses.join(", ")}
          ON CONFLICT (name) DO NOTHING
        `;
        const result = await client.query(query, queryParams);
        insertedCount += result.rowCount || 0;
      }
    }
    console.log(
      `Institution seeding finished successfully. (${insertedCount} new records inserted)`,
    );
  } catch (error) {
    console.error("Error during institution seeding:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedInstitutions().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
