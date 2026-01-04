// app/api/jenkins/approve/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  // Terima buildId, jobName, dan action (approve/abort)
  const { buildId, jobName, action } = await request.json();
  const { JENKINS_URL, JENKINS_USER, JENKINS_API_TOKEN } = process.env;
  const auth = Buffer.from(`${JENKINS_USER}:${JENKINS_API_TOKEN}`).toString('base64');
  const headers = { 'Authorization': `Basic ${auth}` };

  if (!buildId || !jobName || !action) {
    return NextResponse.json({ 
      message: 'Build ID, Job Name, and Action required' 
    }, { status: 400 });
  }

  try {
    console.log(`🔍 Mencari Input ID untuk Job: ${jobName} | Build: #${buildId} | Action: ${action}...`);
    
    // 1. Cari ID Input Dinamis berdasarkan Job Name spesifik
    const checkRes = await fetch(
      `${JENKINS_URL}/job/${jobName}/${buildId}/wfapi/pendingInputActions`,
      { headers, cache: 'no-store' }
    );

    if (!checkRes.ok) throw new Error("Gagal mengambil info Jenkins");

    const actions = await checkRes.json();
    if (!actions || actions.length === 0) {
      return NextResponse.json({ 
        message: 'Build ini sudah tidak menunggu approval.' 
      }, { status: 400 });
    }

    const inputId = actions[0].id; 
    console.log(`✅ Input ID Ditemukan: ${inputId}`);

    // 2. Tentukan URL berdasarkan action (approve atau abort)
    let actionUrl;
    let actionMessage;

    if (action === 'approve') {
      actionUrl = `${JENKINS_URL}/job/${jobName}/${buildId}/input/${inputId}/proceedEmpty`;
      actionMessage = 'Approved';
    } else if (action === 'abort') {
      actionUrl = `${JENKINS_URL}/job/${jobName}/${buildId}/input/${inputId}/abort`;
      actionMessage = 'Aborted';
    } else {
      return NextResponse.json({ 
        message: 'Invalid action. Use "approve" or "abort".' 
      }, { status: 400 });
    }

    // 3. Kirim request ke Jenkins
    const actionRes = await fetch(actionUrl, { 
      method: 'POST', 
      headers 
    });

    if (actionRes.ok) {
      return NextResponse.json({ 
        success: true, 
        message: `Pipeline ${jobName} #${buildId} ${actionMessage}!` 
      });
    } else {
      throw new Error(await actionRes.text());
    }
  } catch (error) {
    console.error("Server Error:", error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}