import { NextResponse } from 'next/server';

export async function GET() {
  const { JENKINS_URL, JENKINS_USER, JENKINS_API_TOKEN } = process.env;

  if (!JENKINS_URL || !JENKINS_USER || !JENKINS_API_TOKEN) {
    return NextResponse.json(
      { error: 'Konfigurasi Jenkins tidak lengkap di ENV' },
      { status: 500 }
    );
  }

  const auth = Buffer.from(`${JENKINS_USER}:${JENKINS_API_TOKEN}`).toString('base64');

  try {
    // 1. Fetch daftar semua jobs dari Jenkins secara otomatis
    const jobsResponse = await fetch(`${JENKINS_URL}/api/json`, {
      headers: { 'Authorization': `Basic ${auth}` },
      cache: 'no-store'
    });

    if (!jobsResponse.ok) {
      throw new Error(`Gagal fetch daftar jobs: ${jobsResponse.statusText}`);
    }

    const jenkinsData = await jobsResponse.json();
    const jobs = jenkinsData.jobs || [];

    if (jobs.length === 0) {
      return NextResponse.json({ message: 'Tidak ada job ditemukan di Jenkins' });
    }

    // 2. Extract nama job dari setiap item
    const jobNames = jobs.map(job => job.name);

    console.log('Total jobs ditemukan:', jobNames.length);
    console.log('Jobs:', jobNames);

    // 3. Fetch data dari SEMUA job secara Paralel (Promise.all)
    const promises = jobNames.map(async (jobName) => {
      try {
        const res = await fetch(`${JENKINS_URL}/job/${jobName}/wfapi/runs`, {
          headers: { 'Authorization': `Basic ${auth}` },
          cache: 'no-store'
        });

        if (!res.ok) {
          console.log(`Job ${jobName}: HTTP ${res.status}`);
          return [];
        }

        const runs = await res.json();
        console.log(`Job ${jobName}: ${runs.length} runs ditemukan`);

        // Filter & Map data
        const pending = runs
          .filter((run) => {
            console.log(`  - Run ${run.id}: status = ${run.status}`);
            return run.status === 'PAUSED_PENDING_INPUT';
          })
          .map((run) => ({
            id: run.id,
            name: run.name,
            status: run.status,
            timestamp: run.startTimeMillis,
            jobName: jobName
          }));

        if (pending.length > 0) {
          console.log(`Job ${jobName}: ${pending.length} pending approval ditemukan!`);
        }

        return pending;
      } catch (err) {
        console.error(`Gagal fetch job ${jobName}:`, err.message);
        return [];
      }
    });

    // Tunggu semua request selesai
    const results = await Promise.all(promises);

    // 4. Gabungkan array of arrays menjadi satu array flat (single list)
    const allPendingBuilds = results.flat();

    // Urutkan berdasarkan waktu (terbaru diatas)
    allPendingBuilds.sort((a, b) => b.timestamp - a.timestamp);

    console.log('Total pending builds:', allPendingBuilds.length);

    return NextResponse.json({
      totalJobs: jobNames.length,
      pendingBuilds: allPendingBuilds.length,
      data: allPendingBuilds
    });

  } catch (error) {
    console.error('Error utama:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}