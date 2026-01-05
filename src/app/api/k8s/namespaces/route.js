import { NextResponse } from 'next/server';
import * as k8s from '@kubernetes/client-node';

export async function GET() {
  try {
    const kc = new k8s.KubeConfig();
    
    // Setup Konfigurasi dari ENV
    kc.loadFromOptions({
      clusters: [{
        name: 'remote-cluster',
        server: process.env.K8S_API_URL,
        skipTLSVerify: true, // Sangat penting untuk IP Publik/Self-signed
      }],
      users: [{
        name: 'dashboard-sa',
        token: process.env.K8S_TOKEN,
      }],
      contexts: [{
        name: 'remote-context',
        user: 'dashboard-sa',
        cluster: 'remote-cluster',
      }],
      currentContext: 'remote-context',
    });

    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    // Panggil API
    const res = await k8sApi.listNamespace();

    // DEBUGGING: Cek di console terminal Next.js apa isi 'res' sebenarnya
    // console.log("Raw Response:", res);

    // Ambil data dengan proteksi (Optional Chaining)
    // Beberapa versi library mengembalikan data langsung di 'res', 
    // beberapa di 'res.body'
    const items = res.body?.items || res.items || [];

    if (items.length === 0 && !res.body) {
       throw new Error("API berhasil dipanggil tapi tidak ada data (Response Body kosong)");
    }

    const namespaces = items.map(ns => ns.metadata.name);
    namespaces.sort();

    return NextResponse.json({
      success: true,
      namespaces: namespaces,
      count: namespaces.length
    });

  } catch (error) {
    // Log error lebih detail agar kita tahu penyebab 'undefined' tadi
    console.error('--- K8S API ERROR START ---');
    if (error.response) {
      // Ini jika server K8s merespon dengan error (401, 403, dll)
      console.error('Status:', error.response.statusCode);
      console.error('Body:', error.response.body);
    } else {
      // Ini jika ada error koneksi atau code error
      console.error('Message:', error.message);
    }
    console.error('--- K8S API ERROR END ---');

    return NextResponse.json({
      success: false,
      message: `Gagal fetch namespace: ${error.message}`,
      // Kirim status code asli dari K8s jika ada
      status: error.response?.statusCode || 500
    }, { status: 500 });
  }
}