import { NextResponse } from 'next/server';

export async function POST(request) {
  // Terima buildId DAN jobName
  const { buildId, jobName } = await request.json();
  const { JENKINS_URL, JENKINS_USER, JENKINS_API_TOKEN } = process.env;
  
  const auth = Buffer.from(`${JENKINS_USER}:${JENKINS_API_TOKEN}`).toString('base64');
  const headers = { 'Authorization': `Basic ${auth}` };

  if (!buildId || !jobName) {
    return NextResponse.json({ message: 'Build ID and Job Name required' }, { status: 400 });
  }

  try {
    console.log(`🔍 Mencari Input ID untuk Job: ${jobName} | Build: #${buildId}...`);

    // 1. Cari ID Input Dinamis berdasarkan Job Name spesifik
    const checkRes = await fetch(
      `${JENKINS_URL}/job/${jobName}/${buildId}/wfapi/pendingInputActions`,
      { headers, cache: 'no-store' }
    );

    if (!checkRes.ok) throw new Error("Gagal mengambil info Jenkins");

    const actions = await checkRes.json();

    if (!actions || actions.length === 0) {
      return NextResponse.json({ message: 'Build ini sudah tidak menunggu approval.' }, { status: 400 });
    }

    const inputId = actions[0].id; 
    console.log(`✅ Input ID Ditemukan: ${inputId}`);

    // 2. Approve ke URL Job yang sesuai
    const approveUrl = `${JENKINS_URL}/job/${jobName}/${buildId}/input/${inputId}/proceedEmpty`;
    
    const approveRes = await fetch(approveUrl, { 
        method: 'POST', 
        headers 
    });

    if (approveRes.ok) {
      return NextResponse.json({ success: true, message: `Pipeline ${jobName} #${buildId} Approved!` });
    } else {
      throw new Error(await approveRes.text());
    }

  } catch (error) {
    console.error("Server Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}