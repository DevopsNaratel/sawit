// app/api/k8s/secret/route.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { secretName, namespace, data, secretType } = await request.json();
    
    // Validasi input
    if (!secretName || !namespace || !data || Object.keys(data).length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Secret name, namespace, dan data diperlukan' 
      }, { status: 400 });
    }

    // Get Kubernetes config from env
    const { K8S_API_URL, K8S_TOKEN, K8S_NAMESPACE } = process.env;
    
    if (!K8S_API_URL || !K8S_TOKEN) {
      return NextResponse.json({ 
        success: false,
        message: 'Kubernetes config tidak ditemukan di environment' 
      }, { status: 500 });
    }

    // Encode data to base64 (Kubernetes requirement)
    const encodedData = {};
    for (const [key, value] of Object.entries(data)) {
      encodedData[key] = Buffer.from(value).toString('base64');
    }

    // Prepare secret payload
    const secretPayload = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: secretName,
        namespace: namespace || K8S_NAMESPACE || 'default'
      },
      type: secretType || 'Opaque',
      data: encodedData
    };

    const headers = {
      'Authorization': `Bearer ${K8S_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Try to create secret
    const createUrl = `${K8S_API_URL}/api/v1/namespaces/${secretPayload.metadata.namespace}/secrets`;
    
    console.log(`🔐 Creating secret: ${secretName} in namespace: ${secretPayload.metadata.namespace}`);
    
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(secretPayload)
    });

    if (createRes.ok) {
      const result = await createRes.json();
      return NextResponse.json({ 
        success: true,
        message: `Secret "${secretName}" berhasil dibuat di namespace "${secretPayload.metadata.namespace}"`,
        data: result
      });
    } 
    
    // If creation fails with 409 (already exists), try to update
    if (createRes.status === 409) {
      console.log(`🔄 Secret sudah ada, mencoba update...`);
      
      const updateUrl = `${K8S_API_URL}/api/v1/namespaces/${secretPayload.metadata.namespace}/secrets/${secretName}`;
      
      const updateRes = await fetch(updateUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(secretPayload)
      });

      if (updateRes.ok) {
        const result = await updateRes.json();
        return NextResponse.json({ 
          success: true,
          message: `Secret "${secretName}" berhasil diupdate di namespace "${secretPayload.metadata.namespace}"`,
          data: result
        });
      } else {
        const errorText = await updateRes.text();
        throw new Error(`Update failed: ${errorText}`);
      }
    }

    // Handle other errors
    const errorText = await createRes.text();
    throw new Error(`Kubernetes API error: ${errorText}`);

  } catch (error) {
    console.error('❌ Error creating/updating secret:', error.message);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

// GET endpoint untuk list secrets (optional)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const namespace = searchParams.get('namespace') || process.env.K8S_NAMESPACE || 'default';

    const { K8S_API_URL, K8S_TOKEN } = process.env;
    
    if (!K8S_API_URL || !K8S_TOKEN) {
      return NextResponse.json({ 
        success: false,
        message: 'Kubernetes config tidak ditemukan' 
      }, { status: 500 });
    }

    const headers = {
      'Authorization': `Bearer ${K8S_TOKEN}`,
      'Accept': 'application/json'
    };

    const url = `${K8S_API_URL}/api/v1/namespaces/${namespace}/secrets`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`Failed to fetch secrets: ${res.statusText}`);
    }

    const data = await res.json();
    
    // Filter dan format data
    const secrets = data.items.map(secret => ({
      name: secret.metadata.name,
      namespace: secret.metadata.namespace,
      type: secret.type,
      createdAt: secret.metadata.creationTimestamp,
      dataKeys: Object.keys(secret.data || {})
    }));

    return NextResponse.json({ 
      success: true,
      secrets,
      namespace 
    });

  } catch (error) {
    console.error('Error fetching secrets:', error.message);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}