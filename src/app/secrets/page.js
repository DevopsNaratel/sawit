'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Plus, Trash2, Lock, Server, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Upload, FileText, X } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function K8sSecretManager() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingSecrets, setExistingSecrets] = useState([]);
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showValues, setShowValues] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [namespaces, setNamespaces] = useState([]);
  const [loadingNamespaces, setLoadingNamespaces] = useState(true);

  const handlePageChange = (page) => {
    if (page === 'jenkins') {
      router.push('/');
    } else if (page === 'k8s-secret') {
      router.push('/secrets');
    }
  };

  // Form state
  const [form, setForm] = useState({
    secretName: '',
    namespace: 'default',
    secretType: 'Opaque',
    secretData: [{ key: '', value: '' }]
  });

  // Fetch existing secrets
  const fetchSecrets = async () => {
    setLoadingSecrets(true);
    try {
      const res = await fetch(`/api/k8s/secret?namespace=${form.namespace}`);
      const data = await res.json();
      if (data.success) {
        setExistingSecrets(data.secrets || []);
      }
    } catch (error) {
      console.error('Error fetching secrets:', error);
    } finally {
      setLoadingSecrets(false);
    }
  };

  // Fetch available namespaces
  const fetchNamespaces = async () => {
    try {
      const res = await fetch('/api/k8s/namespaces');
      const data = await res.json();
      if (data.success) {
        setNamespaces(data.namespaces || []);
      }
    } catch (error) {
      console.error('Error fetching namespaces:', error);
      // Fallback to default if API fails
      setNamespaces(['default']);
    } finally {
      setLoadingNamespaces(false);
    }
  };

  // Handle secret card click - AUTOFILL FORM
  const handleSecretClick = (secretName) => {
    setForm(prev => ({
      ...prev,
      secretName: secretName
    }));
    setMessage({ text: `Secret "${secretName}" dipilih - silakan edit dan submit untuk update`, type: 'success' });
  };

  useEffect(() => {
    fetchNamespaces();
  }, []);

  useEffect(() => {
    fetchSecrets();
  }, [form.namespace]);

  // Parse .env file
  const parseEnvFile = (content) => {
    const lines = content.split('\n');
    const parsed = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) return;

      // Parse KEY=VALUE format
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        parsed.push({ key, value });
      }
    });

    return parsed;
  };

  // Handle file upload
  const handleFile = (file) => {
    if (!file.name.endsWith('.env') && !file.name.startsWith('.env')) {
      setMessage({ text: 'Harap upload file .env yang valid', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsed = parseEnvFile(content);
        
        if (parsed.length === 0) {
          setMessage({ text: 'File .env kosong atau format tidak valid', type: 'error' });
          return;
        }

        setForm(prev => ({
          ...prev,
          secretData: parsed
        }));
        setFileName(file.name);
        setMessage({ text: `✅ ${parsed.length} variabel berhasil dimuat dari ${file.name}`, type: 'success' });
      } catch (err) {
        setMessage({ text: 'Gagal membaca file .env', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const clearEnvFile = () => {
    setFileName('');
    setForm(prev => ({
      ...prev,
      secretData: [{ key: '', value: '' }]
    }));
    setShowValues({});
  };

  // Add new key-value pair
  const addSecretField = () => {
    setForm({
      ...form,
      secretData: [...form.secretData, { key: '', value: '' }]
    });
  };

  // Remove key-value pair
  const removeSecretField = (index) => {
    const newData = form.secretData.filter((_, i) => i !== index);
    setForm({ ...form, secretData: newData });
  };

  // Update key-value pair
  const updateSecretField = (index, field, value) => {
    const newData = [...form.secretData];
    newData[index][field] = value;
    setForm({ ...form, secretData: newData });
  };

  // Toggle show/hide value
  const toggleShowValue = (index) => {
    setShowValues(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Submit handler
  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Validation
    if (!form.secretName || !form.namespace) {
      setMessage({ text: 'Secret name dan namespace diperlukan', type: 'error' });
      setLoading(false);
      return;
    }

    // Convert secretData array to object
    const dataObject = {};
    form.secretData.forEach(item => {
      if (item.key && item.value) {
        dataObject[item.key] = item.value;
      }
    });

    if (Object.keys(dataObject).length === 0) {
      setMessage({ text: 'Minimal satu key-value pair diperlukan', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/k8s/secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretName: form.secretName,
          namespace: form.namespace,
          secretType: form.secretType,
          data: dataObject
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        // Reset form
        setForm({
          secretName: '',
          namespace: 'default',
          secretType: 'Opaque',
          secretData: [{ key: '', value: '' }]
        });
        setShowValues({});
        setFileName('');
        // Refresh secrets list
        setTimeout(fetchSecrets, 1000);
      } else {
        setMessage({ text: data.message || 'Gagal membuat secret', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const secretTypes = ['Opaque', 'kubernetes.io/tls', 'kubernetes.io/dockerconfigjson', 'kubernetes.io/basic-auth'];

  return (
    <>
      <Navigation activePage="k8s-secret" onPageChange={handlePageChange} />
      
      <div className="min-h-screen bg-neutral-950 text-white">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-600/20 rounded-lg border border-purple-500/30">
              <Lock size={24} className="text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold">Kubernetes Secret Manager</h1>
          </div>
          <p className="text-neutral-400 ml-12">Kelola secrets di cluster Kubernetes Anda</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Key size={20} className="text-purple-400" />
                Create New Secret
              </h2>

              <div className="space-y-5">
                {/* Drag & Drop Area */}
                {form.secretData.length === 1 && !form.secretData[0].key && !form.secretData[0].value && !fileName && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-neutral-700 bg-neutral-950/50 hover:border-neutral-600'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".env"
                      onChange={handleFileInput}
                      className="hidden"
                      id="env-file-input"
                    />
                    <label htmlFor="env-file-input" className="cursor-pointer">
                      <Upload className="mx-auto mb-3 text-neutral-500" size={40} />
                      <p className="text-base font-semibold text-neutral-300 mb-1">
                        Drag & drop file .env di sini
                      </p>
                      <p className="text-sm text-neutral-500">
                        atau klik untuk memilih file
                      </p>
                    </label>
                  </div>
                )}

                {/* File Info (if loaded) */}
                {fileName && (
                  <div className="flex items-center justify-between bg-neutral-950 border border-neutral-800 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="text-green-400" size={20} />
                      <div>
                        <p className="font-semibold text-sm text-white">{fileName}</p>
                        <p className="text-xs text-neutral-500">
                          {form.secretData.length} variabel dimuat
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearEnvFile}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {/* Secret Name & Namespace */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 block">
                      Secret Name
                    </label>
                    <input
                      type="text"
                      value={form.secretName}
                      onChange={(e) => setForm({ ...form, secretName: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      placeholder="my-secret"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 block">
                      Namespace
                    </label>
                    {loadingNamespaces ? (
                      <div className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 flex items-center gap-2 text-neutral-500">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">Loading namespaces...</span>
                      </div>
                    ) : (
                      <select
                        value={form.namespace}
                        onChange={(e) => setForm({ ...form, namespace: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      >
                        {namespaces.map(ns => (
                          <option key={ns} value={ns}>{ns}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Secret Type */}
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 block">
                    Secret Type
                  </label>
                  <select
                    value={form.secretType}
                    onChange={(e) => setForm({ ...form, secretType: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  >
                    {secretTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Secret Data (Key-Value Pairs) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Secret Data
                    </label>
                    <button
                      onClick={addSecretField}
                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Plus size={14} />
                      Add Field
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {form.secretData.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item.key}
                          onChange={(e) => updateSecretField(index, 'key', e.target.value)}
                          className="flex-1 bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-all text-sm font-mono"
                          placeholder="Key (e.g., DB_PASSWORD)"
                        />
                        <div className="flex-1 relative">
                          <input
                            type={showValues[index] ? 'text' : 'password'}
                            value={item.value}
                            onChange={(e) => updateSecretField(index, 'value', e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-purple-500 transition-all text-sm font-mono"
                            placeholder="Value"
                          />
                          <button
                            onClick={() => toggleShowValue(index)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                          >
                            {showValues[index] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {form.secretData.length > 1 && (
                          <button
                            onClick={() => removeSecretField(index)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-purple-500/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Creating Secret...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Create / Update Secret
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Existing Secrets List */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Server size={20} className="text-indigo-400" />
                Existing Secrets
              </h2>

              <div className="mb-4 text-xs text-neutral-500">
                Namespace: <span className="text-indigo-400 font-semibold">{form.namespace}</span>
              </div>

              {loadingSecrets ? (
                <div className="flex items-center justify-center py-8 text-neutral-500">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : existingSecrets.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  <Lock size={32} className="mx-auto mb-2 opacity-50" />
                  Tidak ada secret
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {existingSecrets.map((secret, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSecretClick(secret.name)}
                      className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 hover:border-purple-500 hover:bg-neutral-900/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white truncate">{secret.name}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{secret.type}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Key size={12} className="text-neutral-600" />
                            <span className="text-xs text-neutral-600">
                              {secret.dataKeys.length} keys
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg text-sm text-neutral-400">
          <p className="mb-2"><strong className="text-white">💡 Tips:</strong></p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Upload file .env untuk load semua variabel sekaligus</li>
            <li>Klik pada card secret di sebelah kanan untuk edit secret yang sudah ada</li>
            <li>Secret name harus huruf kecil dan dapat menggunakan dash (-)</li>
            <li>Data akan di-encode base64 secara otomatis</li>
            <li>Jika secret sudah ada, sistem akan melakukan update</li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}