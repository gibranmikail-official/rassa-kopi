import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Crown,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';
import {
  createCmsAccount,
  deleteAdminAccountRecord,
  fetchAdminAccounts,
  toggleAdminAccountActive,
  updateAdminAccountRole,
} from '@/src/lib/cmsService';
import type { AdminRole, CmsAdminAccount } from '@/src/types/cms';

export function AccountsTab({
  currentUserId,
  onNotify,
}: {
  currentUserId: string;
  onNotify: (type: 'success' | 'error', text: string) => void;
}) {
  const [accounts, setAccounts] = useState<CmsAdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<AdminRole>('admin');

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAdminAccounts();
      setAccounts(list);
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Gagal memuat daftar akun admin.'
      );
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const handleCreateAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      onNotify('error', 'Email valid dan password minimal 6 karakter wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createCmsAccount({
        email,
        password,
        fullName,
        role,
      });
      onNotify(
        'success',
        result === 'updated_existing'
          ? `Role untuk ${email.trim()} berhasil diperbarui menjadi ${role}.`
          : `Akun baru ${email.trim()} (${role}) berhasil dibuat dan langsung aktif.`
      );
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('admin');
      await loadAccounts();
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Gagal menambahkan akun baru.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (account: CmsAdminAccount, nextRole: AdminRole) => {
    if (account.role === nextRole) return;
    setSubmitting(true);
    try {
      await updateAdminAccountRole(account.id, nextRole);
      onNotify(
        'success',
        `Role ${account.email} diubah menjadi ${
          nextRole === 'super_admin' ? 'Super Admin' : 'Admin'
        }.`
      );
      await loadAccounts();
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Gagal mengubah role akun.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (account: CmsAdminAccount) => {
    setSubmitting(true);
    try {
      await toggleAdminAccountActive(account.id, !account.isActive);
      onNotify(
        'success',
        `Akun ${account.email} ${
          !account.isActive ? 'diaktifkan kembali' : 'dinonaktifkan'
        }.`
      );
      await loadAccounts();
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Gagal mengubah status akun.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (account: CmsAdminAccount) => {
    setSubmitting(true);
    try {
      await deleteAdminAccountRecord(account.id);
      onNotify('success', `Akses CMS untuk ${account.email} telah dihapus.`);
      await loadAccounts();
    } catch (err) {
      onNotify(
        'error',
        err instanceof Error ? err.message : 'Gagal menghapus akses akun.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-black/8 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-4 h-4 text-[#CC0000]" aria-hidden="true" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#CC0000]">
            Super Admin Only
          </span>
        </div>
        <h3 className="font-display text-2xl font-extrabold uppercase text-[#1A1A1A]">
          Kelola Akun & Role CMS
        </h3>
        <p className="text-xs text-[#666666]">
          Tambahkan akun Admin atau Super Admin baru dengan Email & Password serta atur hak akses mereka.
        </p>
      </div>

      {/* Add Account Form */}
      <form
        onSubmit={(e) => void handleCreateAccount(e)}
        className="p-4 sm:p-5 rounded-2xl bg-[#F5F5F5] border border-black/8 space-y-4"
      >
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#CC0000]" aria-hidden="true" />
          <h4 className="font-display text-lg font-extrabold uppercase text-[#1A1A1A]">
            Tambah Akun Baru
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Tim Konten Rassa"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/12 bg-white text-sm text-[#1A1A1A] focus:outline-2 focus:outline-[#CC0000]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Email Login *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rassakopi.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/12 bg-white text-sm text-[#1A1A1A] focus:outline-2 focus:outline-[#CC0000]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Password Awal (Min. 6 Karakter) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-black/12 bg-white text-sm text-[#1A1A1A] focus:outline-2 focus:outline-[#CC0000]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#1A1A1A] p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Role Akses *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/12 bg-white text-sm font-semibold text-[#1A1A1A] focus:outline-2 focus:outline-[#CC0000]"
            >
              <option value="admin">Admin (Kelola Konten CMS saja)</option>
              <option value="super_admin">
                Super Admin (Kelola Konten + Akun & Role)
              </option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <p className="text-[11px] text-[#666666]">
            Akun baru dapat langsung login ke CMS tanpa mengganggu sesi Anda saat ini.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2.5 rounded-full bg-[#CC0000] hover:bg-[#A80000] text-white text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UserPlus className="w-3.5 h-3.5" />
            )}
            <span>{submitting ? 'Memproses...' : 'Buat Akun'}</span>
          </button>
        </div>
      </form>

      {/* Accounts List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-xl font-extrabold uppercase text-[#1A1A1A]">
            Daftar Akun Terdaftar ({accounts.length})
          </h4>
          <button
            type="button"
            onClick={() => void loadAccounts()}
            disabled={loading}
            className="text-xs font-semibold text-[#666666] hover:text-[#CC0000] cursor-pointer"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#666666] bg-[#F5F5F5] rounded-2xl">
            Memuat daftar akun admin...
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#666666] bg-[#F5F5F5] rounded-2xl">
            Belum ada akun admin terdaftar.
          </div>
        ) : (
          <div className="space-y-2.5">
            {accounts.map((acc) => {
              const isSelf = acc.id === currentUserId;
              return (
                <div
                  key={acc.id}
                  className="p-4 rounded-2xl border border-black/8 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-base font-bold text-[#1A1A1A] truncate">
                        {acc.fullName || acc.email}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          acc.role === 'super_admin'
                            ? 'bg-[#CC0000] text-white'
                            : 'bg-[#F5F5F5] text-[#1A1A1A]'
                        }`}
                      >
                        {acc.role === 'super_admin' ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <Shield className="w-3 h-3" />
                        )}
                        <span>
                          {acc.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </span>
                      {!acc.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          Nonaktif
                        </span>
                      )}
                      {isSelf && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Anda
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#666666] truncate">{acc.email}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <select
                      aria-label={`Role for ${acc.email}`}
                      disabled={submitting || isSelf}
                      value={acc.role}
                      onChange={(e) =>
                        void handleRoleChange(acc, e.target.value as AdminRole)
                      }
                      className="px-3 py-1.5 rounded-xl border border-black/12 bg-[#F5F5F5] text-xs font-bold text-[#1A1A1A] disabled:opacity-50 cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>

                    <button
                      type="button"
                      disabled={submitting || isSelf}
                      onClick={() => void handleToggleActive(acc)}
                      className="px-3 py-1.5 rounded-xl border border-black/12 text-xs font-semibold text-[#1A1A1A] hover:border-[#CC0000] hover:text-[#CC0000] disabled:opacity-40 cursor-pointer"
                    >
                      {acc.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>

                    <button
                      type="button"
                      disabled={submitting || isSelf}
                      onClick={() => void handleDeleteAccount(acc)}
                      className="p-2 rounded-xl text-[#666666] hover:text-[#CC0000] hover:bg-[#F5F5F5] disabled:opacity-30 cursor-pointer"
                      aria-label={`Hapus akses ${acc.email}`}
                      title={
                        isSelf
                          ? 'Tidak dapat menghapus akun sendiri'
                          : 'Hapus akses CMS'
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
