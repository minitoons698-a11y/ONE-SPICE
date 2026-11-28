import { useEffect, useMemo, useState } from 'react';
import {
  EmailAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  BarChart3,
  Check,
  Clock,
  ExternalLink,
  ImagePlus,
  Inbox,
  KeyRound,
  LogOut,
  Mail,
  Package,
  Pencil,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import {
  AdminAccount,
  AdminRole,
  CATEGORIES,
  CulinaryCategory,
  CustomerOrder,
  OrderStatus,
  PasswordResetRequest,
  PaymentSettings,
  SHOP_INFO,
  SPICES as DEFAULT_SPICES,
  ShopInquiry,
  Spice,
  formatUGX,
} from '../data/spices';
import {
  OperationType,
  PRIMARY_MAJOR_ADMIN_EMAIL,
  auth,
  db,
  emailToAccountId,
  getSecondaryAuth,
  googleProvider,
  handleFirestoreError,
  isBootstrappedMajorAdminEmail,
} from '../lib/firebase';
import { SpiceImage } from './SpiceImage';

interface AdminPageProps {
  liveSpices: Spice[];
  paymentSettings: PaymentSettings;
}

type AdminTab =
  | 'stats'
  | 'orders'
  | 'spices'
  | 'payments'
  | 'team'
  | 'inquiries'
  | 'account';

type LoginMode = 'signin' | 'recover';

const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

function slugifyId(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || `spice-${Date.now()}`
  );
}

async function compressImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file format.'));
      img.onload = () => {
        const maxWidth = 900;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.82;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > 420000 && quality > 0.35) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (dataUrl.length > 440000) {
          reject(new Error('Image is still too large after compression. Please pick a smaller image.'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function createEmptySpiceForm(): Spice {
  return {
    id: '',
    name: '',
    botanicalName: '',
    category: 'Floral & Rare',
    grade: 'Premium Reserve',
    image: '',
    imageAlt: '',
    shortDescription: '',
    inStock: true,
    weightTiers: [
      { label: '50g Pouch', grams: 50, price: 35000 },
      { label: '100g Apothecary Jar', grams: 100, price: 65000 },
      { label: '250g Pantry Tin', grams: 250, price: 145000 },
    ],
    pairings: [],
  };
}

export function AdminPage({ liveSpices, paymentSettings }: AdminPageProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);

  // Login / Recovery state
  const [loginMode, setLoginMode] = useState<LoginMode>('signin');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [needsEmailProviderSetup, setNeedsEmailProviderSetup] = useState(false);

  // Recovery escalation state
  const [resetNote, setResetNote] = useState('');

  // Admin account doc & role state
  const [ownAccount, setOwnAccount] = useState<AdminAccount | null>(null);
  const [accountLoaded, setAccountLoaded] = useState(false);

  // Major-admin collections
  const [activeTab, setActiveTab] = useState<AdminTab>('spices');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [inquiries, setInquiries] = useState<ShopInquiry[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);
  const [orderFilterStatus, setOrderFilterStatus] = useState<'All' | OrderStatus>('All');

  // Spice Editor state
  const [editingSpice, setEditingSpice] = useState<Spice | null>(null);
  const [isNewSpice, setIsNewSpice] = useState(false);
  const [isSavingSpice, setIsSavingSpice] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [spiceFeedback, setSpiceFeedback] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Payment Numbers (+256) form state
  const [momoNumber, setMomoNumber] = useState(paymentSettings.momoNumber);
  const [momoName, setMomoName] = useState(paymentSettings.momoName);
  const [airtelNumber, setAirtelNumber] = useState(paymentSettings.airtelNumber);
  const [airtelName, setAirtelName] = useState(paymentSettings.airtelName);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState<string | null>(null);

  // Team Management (Add Admin / Major Admin) state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('admin');
  const [teamBusy, setTeamBusy] = useState(false);
  const [teamFeedback, setTeamFeedback] = useState<string | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);

  // Change own password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newOwnPassword, setNewOwnPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    setMomoNumber(paymentSettings.momoNumber);
    setMomoName(paymentSettings.momoName);
    setAirtelNumber(paymentSettings.airtelNumber);
    setAirtelName(paymentSettings.airtelName);
  }, [paymentSettings]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Load own admin account document to determine role ('admin' | 'major_admin')
  useEffect(() => {
    if (!authReady || !user?.email) {
      setOwnAccount(null);
      setAccountLoaded(true);
      return;
    }

    const accountId = emailToAccountId(user.email);
    const unsub = onSnapshot(
      doc(db, 'adminAccounts', accountId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setOwnAccount({
            docId: snap.id,
            email: String(data.email ?? user.email),
            displayName: String(data.displayName ?? user.email),
            role: data.role === 'major_admin' ? 'major_admin' : 'admin',
            mustChangePassword: Boolean(data.mustChangePassword),
            createdBy: String(data.createdBy ?? ''),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        } else {
          setOwnAccount(null);
        }
        setAccountLoaded(true);
      },
      () => {
        // Non-admins receive permission-denied on adminAccounts read; mark loaded so restricted UI renders cleanly
        setOwnAccount(null);
        setAccountLoaded(true);
      }
    );

    return () => unsub();
  }, [authReady, user?.email]);

  const isMajorAdmin = Boolean(
    user?.email &&
      (isBootstrappedMajorAdminEmail(user.email) || ownAccount?.role === 'major_admin')
  );
  const isAnyAdmin = Boolean(isMajorAdmin || ownAccount);
  const currentRole: AdminRole | null = isMajorAdmin ? 'major_admin' : ownAccount ? 'admin' : null;

  // Default tab to 'stats' when Major Admin signs in
  useEffect(() => {
    if (isMajorAdmin) {
      setActiveTab((prev) => (prev === 'spices' ? 'stats' : prev));
    } else if (isAnyAdmin) {
      setActiveTab((prev) =>
        prev === 'stats' || prev === 'orders' || prev === 'payments' || prev === 'team' || prev === 'inquiries'
          ? 'spices'
          : prev
      );
    }
  }, [isMajorAdmin, isAnyAdmin]);

  // Listen to global sessionEpoch so "Sign Out All Admins" signs out active sessions
  useEffect(() => {
    if (!authReady || !user || !isAnyAdmin) return;
    const unsub = onSnapshot(
      doc(db, 'settings', 'security'),
      (snap) => {
        if (!snap.exists()) return;
        const epoch = Number(snap.data().sessionEpoch ?? 0);
        const lastSignInMs = user.metadata.lastSignInTime
          ? new Date(user.metadata.lastSignInTime).getTime()
          : 0;
        if (epoch > 0 && lastSignInMs > 0 && epoch > lastSignInMs + 2000) {
          signOut(auth).catch(() => undefined);
        }
      },
      () => undefined
    );
    return () => unsub();
  }, [authReady, user, isAnyAdmin]);

  // Ensure bootstrapped major admin has a visible row in adminAccounts
  useEffect(() => {
    if (!user?.email || !isBootstrappedMajorAdminEmail(user.email) || ownAccount || !accountLoaded) {
      return;
    }
    const accountId = emailToAccountId(user.email);
    setDoc(doc(db, 'adminAccounts', accountId), {
      email: user.email.toLowerCase(),
      displayName: user.displayName || 'Major Admin',
      role: 'major_admin',
      mustChangePassword: false,
      createdBy: 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch(() => undefined);
  }, [user?.email, user?.displayName, ownAccount, accountLoaded]);

  // Subscribe to Major Admin operational collections ONLY when authenticated as Major Admin
  useEffect(() => {
    if (!authReady || !isMajorAdmin) {
      setOrders([]);
      setInquiries([]);
      setAdminAccounts([]);
      setResetRequests([]);
      return;
    }

    const unsubOrders = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const loaded: CustomerOrder[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            docId: d.id,
            orderNumber: String(data.orderNumber ?? d.id),
            customerName: String(data.customerName ?? ''),
            customerPhone: String(data.customerPhone ?? ''),
            customerEmail: String(data.customerEmail ?? ''),
            fulfillment: data.fulfillment === 'delivery' ? 'delivery' : 'pickup',
            deliveryAddress: String(data.deliveryAddress ?? ''),
            paymentMethod:
              data.paymentMethod === 'airtel'
                ? 'airtel'
                : data.paymentMethod === 'cod'
                ? 'cod'
                : 'momo',
            paymentPhone: String(data.paymentPhone ?? ''),
            paymentReference: String(data.paymentReference ?? ''),
            paymentConfirmed: Boolean(data.paymentConfirmed),
            notes: String(data.notes ?? ''),
            items: Array.isArray(data.items) ? data.items : [],
            subtotal: Number(data.subtotal ?? 0),
            deliveryFee: Number(data.deliveryFee ?? 0),
            total: Number(data.total ?? 0),
            status: (data.status as OrderStatus) ?? 'Pending',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        setOrders(loaded);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
    );

    const unsubInquiries = onSnapshot(
      query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const loaded: ShopInquiry[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            docId: d.id,
            name: String(data.name ?? ''),
            email: String(data.email ?? ''),
            topic: String(data.topic ?? ''),
            message: String(data.message ?? ''),
            status: data.status === 'Replied' ? 'Replied' : 'New',
            createdAt: data.createdAt,
          };
        });
        setInquiries(loaded);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'inquiries')
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'adminAccounts'),
      (snapshot) => {
        const loaded: AdminAccount[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            docId: d.id,
            email: String(data.email ?? ''),
            displayName: String(data.displayName ?? ''),
            role: data.role === 'major_admin' ? 'major_admin' : 'admin',
            mustChangePassword: Boolean(data.mustChangePassword),
            createdBy: String(data.createdBy ?? ''),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        setAdminAccounts(loaded);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'adminAccounts')
    );

    const unsubResets = onSnapshot(
      query(collection(db, 'passwordResetRequests'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const loaded: PasswordResetRequest[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            docId: d.id,
            email: String(data.email ?? ''),
            note: String(data.note ?? ''),
            status: data.status === 'Resolved' ? 'Resolved' : 'Pending',
            createdAt: data.createdAt,
          };
        });
        setResetRequests(loaded);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'passwordResetRequests')
    );

    return () => {
      unsubOrders();
      unsubInquiries();
      unsubAdmins();
      unsubResets();
    };
  }, [authReady, isMajorAdmin]);

  // Statistics & Cash Inflow calculations for Major Admin
  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalInflow = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const confirmedInflow = activeOrders
      .filter((o) => o.paymentConfirmed || o.status === 'Completed')
      .reduce((sum, o) => sum + o.total, 0);
    const pendingInflow = Math.max(0, totalInflow - confirmedInflow);

    const byPayment = {
      momo: activeOrders.filter((o) => o.paymentMethod === 'momo').reduce((s, o) => s + o.total, 0),
      airtel: activeOrders.filter((o) => o.paymentMethod === 'airtel').reduce((s, o) => s + o.total, 0),
      cod: activeOrders.filter((o) => o.paymentMethod === 'cod').reduce((s, o) => s + o.total, 0),
    };

    const spiceMap = new Map<string, { name: string; units: number; revenue: number }>();
    for (const order of activeOrders) {
      for (const item of order.items) {
        const existing = spiceMap.get(item.name) ?? { name: item.name, units: 0, revenue: 0 };
        existing.units += item.quantity;
        existing.revenue += item.unitPrice * item.quantity;
        spiceMap.set(item.name, existing);
      }
    }
    const topSpices = Array.from(spiceMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      activeCount: activeOrders.length,
      pendingCount: orders.filter((o) => o.status === 'Pending' || o.status === 'Preparing').length,
      totalInflow,
      confirmedInflow,
      pendingInflow,
      averageOrder: activeOrders.length > 0 ? totalInflow / activeOrders.length : 0,
      byPayment,
      topSpices,
    };
  }, [orders]);

  // Auth handlers
  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthNotice(null);
    setNeedsEmailProviderSetup(false);
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      setLoginPassword('');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/operation-not-allowed') {
        setNeedsEmailProviderSetup(true);
        setAuthError(
          'Email/Password sign-in is not yet enabled in Firebase Console. Enable it using the link below, or use Sign In with Google right now.'
        );
      } else if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setAuthError(
          'Invalid email or password. Use Forgot Password if you need to reset your password.'
        );
      } else {
        setAuthError(err instanceof Error ? err.message : 'Unable to sign in.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthNotice(null);
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, loginEmail.trim());
      setAuthNotice(`Password recovery email sent to ${loginEmail.trim()}. Check your Gmail inbox.`);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Could not send password reset email.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAskMajorAdminReset = async () => {
    setAuthError(null);
    setAuthNotice(null);
    if (!loginEmail.trim()) {
      setAuthError('Enter your admin Gmail first.');
      return;
    }
    setAuthLoading(true);
    const path = 'passwordResetRequests';
    try {
      await addDoc(collection(db, path), {
        email: loginEmail.trim().toLowerCase().slice(0, 160),
        note: (resetNote || 'Please reset my admin password / send recovery link.').trim().slice(0, 300),
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      setResetNote('');
      setAuthNotice('Password reset request sent to the Major Admin console.');
    } catch (err) {
      setAuthError('Could not submit request right now.');
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthNotice(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleSignOutAllAdmins = async () => {
    if (!user?.email) return;
    const path = 'settings/security';
    try {
      await setDoc(doc(db, 'settings', 'security'), {
        sessionEpoch: Date.now(),
        updatedBy: user.email.toLowerCase(),
        updatedAt: serverTimestamp(),
      });
      await signOut(auth);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // Order handlers
  const handleUpdateOrderStatus = async (order: CustomerOrder, nextStatus: OrderStatus) => {
    const path = `orders/${order.docId}`;
    try {
      await updateDoc(doc(db, 'orders', order.docId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleTogglePaymentConfirmed = async (order: CustomerOrder) => {
    const path = `orders/${order.docId}`;
    try {
      await updateDoc(doc(db, 'orders', order.docId), {
        paymentConfirmed: !order.paymentConfirmed,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleDeleteOrder = async (docId: string) => {
    const path = `orders/${docId}`;
    try {
      await deleteDoc(doc(db, 'orders', docId));
      setConfirmDeleteId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Payment settings (+256 MoMo / Airtel)
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setPaymentSaving(true);
    setPaymentFeedback(null);
    const path = 'settings/payments';
    try {
      await setDoc(doc(db, 'settings', 'payments'), {
        momoNumber: momoNumber.trim().slice(0, 32),
        momoName: momoName.trim().slice(0, 120),
        airtelNumber: airtelNumber.trim().slice(0, 32),
        airtelName: airtelName.trim().slice(0, 120),
        updatedBy: user.email.toLowerCase(),
        updatedAt: serverTimestamp(),
      });
      setPaymentFeedback('Updated +256 MTN MoMo & Airtel Pay numbers for client checkout.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setPaymentSaving(false);
    }
  };

  // Add Admin / Major Admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setTeamError(null);
    setTeamFeedback(null);
    const email = newAdminEmail.trim().toLowerCase();
    if (!email.includes('@')) {
      setTeamError('Please enter a valid Gmail address.');
      return;
    }
    if (newAdminPassword.length < 6) {
      setTeamError('Initial password must be at least 6 characters.');
      return;
    }

    setTeamBusy(true);
    const accountId = emailToAccountId(email);
    const { secondaryAuth, cleanup } = getSecondaryAuth();
    let authStatusNote = '';

    try {
      try {
        await createUserWithEmailAndPassword(secondaryAuth, email, newAdminPassword);
        await signOut(secondaryAuth);
        authStatusNote = 'Login password created and account activated.';
      } catch (authErr: unknown) {
        const code = (authErr as { code?: string })?.code ?? '';
        if (code === 'auth/email-already-in-use') {
          authStatusNote = 'Email already exists in Auth; updated role permissions in directory.';
        } else if (code === 'auth/operation-not-allowed') {
          authStatusNote =
            'Admin added to directory for Google Sign-In (enable Email/Password in Firebase Console to use password login).';
        } else {
          throw authErr;
        }
      }

      await setDoc(doc(db, 'adminAccounts', accountId), {
        email,
        displayName: (newAdminName || email.split('@')[0]).trim().slice(0, 120),
        role: newAdminRole,
        mustChangePassword: true,
        createdBy: user.email.toLowerCase(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setTeamFeedback(`Added ${email} as ${newAdminRole === 'major_admin' ? 'Major Admin' : 'Standard Admin'}. ${authStatusNote}`);
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminPassword('');
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Failed to create admin account.');
    } finally {
      await cleanup();
      setTeamBusy(false);
    }
  };

  const handleToggleAdminRole = async (acc: AdminAccount) => {
    const nextRole: AdminRole = acc.role === 'major_admin' ? 'admin' : 'major_admin';
    const path = `adminAccounts/${acc.docId}`;
    try {
      await updateDoc(doc(db, 'adminAccounts', acc.docId), {
        role: nextRole,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleRemoveAdmin = async (acc: AdminAccount) => {
    if (isBootstrappedMajorAdminEmail(acc.email)) return;
    const path = `adminAccounts/${acc.docId}`;
    try {
      await deleteDoc(doc(db, 'adminAccounts', acc.docId));
      setConfirmDeleteId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleMajorAdminSendResetEmail = async (req: PasswordResetRequest) => {
    try {
      await sendPasswordResetEmail(auth, req.email);
      await updateDoc(doc(db, 'passwordResetRequests', req.docId), { status: 'Resolved' });
      setTeamFeedback(`Sent password reset email to ${req.email} and marked resolved.`);
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Failed to send reset email.');
    }
  };

  const handleResolveResetRequest = async (req: PasswordResetRequest) => {
    const path = `passwordResetRequests/${req.docId}`;
    try {
      await updateDoc(doc(db, 'passwordResetRequests', req.docId), {
        status: req.status === 'Pending' ? 'Resolved' : 'Pending',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  // Own Password Change handler
  const handleChangeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setPasswordError(null);
    setPasswordFeedback(null);

    if (newOwnPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    try {
      const hasPasswordProvider = user.providerData.some((p) => p.providerId === 'password');
      if (hasPasswordProvider) {
        if (!currentPassword) {
          setPasswordError('Please enter your current password to confirm.');
          return;
        }
        const cred = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, cred);
      }
      await updatePassword(user, newOwnPassword);

      const accountId = emailToAccountId(user.email);
      if (ownAccount) {
        await updateDoc(doc(db, 'adminAccounts', accountId), {
          mustChangePassword: false,
          updatedAt: serverTimestamp(),
        });
      }

      setCurrentPassword('');
      setNewOwnPassword('');
      setPasswordFeedback('Your password has been updated.');
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : 'Could not update password. If you signed in with Google, sign in again recently first.'
      );
    }
  };

  // Spice handlers
  const handleToggleInquiryStatus = async (inq: ShopInquiry) => {
    const path = `inquiries/${inq.docId}`;
    try {
      await updateDoc(doc(db, 'inquiries', inq.docId), {
        status: inq.status === 'New' ? 'Replied' : 'New',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleSeedDefaultSpices = async () => {
    setIsSeeding(true);
    setSpiceFeedback(null);
    try {
      for (const spice of DEFAULT_SPICES) {
        await setDoc(doc(db, 'spices', spice.id), {
          ...spice,
          updatedAt: serverTimestamp(),
        });
      }
      setSpiceFeedback('All 9 starter spices synced to Firestore.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'spices');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSpice) return;
    setImageError(null);
    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file);
      setEditingSpice({
        ...editingSpice,
        image: compressedDataUrl,
        imageAlt: editingSpice.imageAlt || `${editingSpice.name || 'One Spice'} photo`,
      });
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to process image.');
    }
  };

  const handleSaveSpice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpice || isSavingSpice) return;

    const finalId = isNewSpice ? slugifyId(editingSpice.id || editingSpice.name) : editingSpice.id;
    if (!editingSpice.image) {
      setImageError('Please upload a picture or paste an image URL before saving.');
      return;
    }

    setIsSavingSpice(true);
    setSpiceFeedback(null);
    const path = `spices/${finalId}`;

    try {
      const payload: Spice & { updatedAt: unknown } = {
        id: finalId,
        name: editingSpice.name.trim().slice(0, 120),
        botanicalName: (editingSpice.botanicalName ?? '').trim().slice(0, 120),
        category: editingSpice.category,
        grade: (editingSpice.grade ?? '').trim().slice(0, 120),
        image: editingSpice.image.trim(),
        imageAlt: (editingSpice.imageAlt || editingSpice.name).trim().slice(0, 240),
        shortDescription: editingSpice.shortDescription.trim().slice(0, 360),
        inStock: Boolean(editingSpice.inStock),
        weightTiers: editingSpice.weightTiers
          .filter((t) => t.label.trim())
          .slice(0, 5)
          .map((t) => ({
            label: t.label.trim(),
            grams: Number(t.grams) || 50,
            price: Number(t.price) || 10000,
          })),
        pairings: (editingSpice.pairings ?? []).slice(0, 6),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'spices', finalId), payload);
      setSpiceFeedback(`Saved "${payload.name}" to One Spice live catalog.`);
      setEditingSpice(null);
      setIsNewSpice(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSavingSpice(false);
    }
  };

  const handleDeleteSpice = async (spiceId: string) => {
    const path = `spices/${spiceId}`;
    try {
      await deleteDoc(doc(db, 'spices', spiceId));
      setConfirmDeleteId(null);
      setSpiceFeedback('Spice removed from Firestore catalog.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const formatTimestamp = (ts: unknown): string => {
    if (
      ts &&
      typeof ts === 'object' &&
      'toDate' in ts &&
      typeof (ts as { toDate: () => Date }).toDate === 'function'
    ) {
      return (ts as { toDate: () => Date }).toDate().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return 'Just now';
  };

  const filteredOrders =
    orderFilterStatus === 'All' ? orders : orders.filter((o) => o.status === orderFilterStatus);

  const pendingResetCount = resetRequests.filter((r) => r.status === 'Pending').length;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 lg:py-14 space-y-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#5C5852]">
        <a href="#/" className="hover:text-[#171614] hover:underline underline-offset-4">
          Home
        </a>
        <span aria-hidden="true">/</span>
        <span className="text-[#171614] font-medium">Admin Panel</span>
      </nav>

      {!authReady || (user && !accountLoaded) ? (
        <div className="py-20 text-center text-sm text-[#5C5852]">Verifying admin session...</div>
      ) : !user ? (
        <div className="max-w-lg mx-auto bg-white rounded-xl border border-[#171614]/10 p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#8C1D2F]/10 text-[#8C1D2F] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-display text-3xl font-medium text-[#171614]">
              {SHOP_INFO.brand} Admin
            </h1>
            <p className="text-sm text-[#5C5852] leading-relaxed">
              Restricted to authorized {SHOP_INFO.brand} admins only. Sign in with your admin Gmail and password or Google account.
            </p>
          </div>

          {/* Login Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#EFECE6] rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setLoginMode('signin');
                setAuthError(null);
                setAuthNotice(null);
              }}
              className={`py-2 rounded-md transition-colors cursor-pointer ${
                loginMode === 'signin' ? 'bg-white text-[#171614] shadow-xs' : 'text-[#5C5852]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('recover');
                setAuthError(null);
                setAuthNotice(null);
              }}
              className={`py-2 rounded-md transition-colors cursor-pointer ${
                loginMode === 'recover' ? 'bg-white text-[#171614] shadow-xs' : 'text-[#5C5852]'
              }`}
            >
              Forgot Password
            </button>
          </div>

          {loginMode === 'signin' && (
            <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#171614] mb-1">
                  Admin Gmail
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#171614] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-5 text-sm font-semibold text-white bg-[#8C1D2F] hover:bg-[#731625] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                {authLoading ? 'Signing In...' : 'Sign In with Gmail & Password'}
              </button>
            </form>
          )}

          {loginMode === 'recover' && (
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#171614] mb-1">
                  Your Admin Gmail
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your registered admin Gmail"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-5 text-sm font-semibold text-white bg-[#171614] hover:bg-[#8C1D2F] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                {authLoading ? 'Sending...' : 'Send Recovery Email Link'}
              </button>
              <div className="pt-3 border-t border-[#171614]/10 space-y-2">
                <p className="text-xs text-[#5C5852]">
                  Or ask an existing Major Admin to recover your access:
                </p>
                <input
                  type="text"
                  value={resetNote}
                  onChange={(e) => setResetNote(e.target.value)}
                  placeholder="Optional note for Major Admin..."
                  className="w-full px-3 py-2 text-xs bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAskMajorAdminReset}
                  disabled={authLoading}
                  className="w-full py-2 px-4 text-xs font-semibold text-[#171614] bg-[#EFECE6] hover:bg-[#E4DFD5] rounded-lg transition-colors cursor-pointer"
                >
                  Request Major Admin Assistance
                </button>
              </div>
            </form>
          )}

          {authError && (
            <div className="p-3 rounded-lg bg-[#8C1D2F]/8 border border-[#8C1D2F]/25 text-xs text-[#8C1D2F] space-y-2">
              <p>{authError}</p>
              {needsEmailProviderSetup && (
                <a
                  href="https://console.firebase.google.com/project/gen-lang-client-0418874515/authentication/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold underline underline-offset-4"
                >
                  <span>Open Firebase Auth Providers Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {authNotice && (
            <div className="p-3 rounded-lg bg-[#EFECE6] border border-[#171614]/15 text-xs text-[#171614]">
              {authNotice}
            </div>
          )}

          <div className="pt-4 border-t border-[#171614]/10 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-5 text-sm font-semibold text-[#171614] bg-[#EFECE6] hover:bg-[#E4DFD5] rounded-lg transition-colors cursor-pointer"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      ) : !isAnyAdmin ? (
        <div className="max-w-lg mx-auto bg-white rounded-xl border border-[#171614]/10 p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#8C1D2F]/10 text-[#8C1D2F] flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-medium text-[#171614]">
            Admin Authorization Required
          </h1>
          <p className="text-sm text-[#5C5852] leading-relaxed">
            Signed in as <span className="font-medium text-[#171614]">{user.email}</span>, which is not listed as a {SHOP_INFO.brand} Admin or Major Admin. Ask <span className="font-mono text-xs">{PRIMARY_MAJOR_ADMIN_EMAIL}</span> to add your Gmail in the Admin Team tab.
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#171614] hover:bg-[#8C1D2F] rounded-lg transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Admin Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#171614]/10">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#8C1D2F]">
                {currentRole === 'major_admin' ? 'Major Admin' : 'Spice Admin'} · {user.email}
              </p>
              <h1 className="font-display text-3xl font-medium text-[#171614] mt-1">
                {SHOP_INFO.brand} Console
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EFECE6] rounded-lg">
                {isMajorAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('stats')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === 'stats'
                        ? 'bg-white text-[#171614] shadow-xs'
                        : 'text-[#5C5852] hover:text-[#171614]'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Cash Inflow &amp; Stats</span>
                  </button>
                )}

                {isMajorAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === 'orders'
                        ? 'bg-white text-[#171614] shadow-xs'
                        : 'text-[#5C5852] hover:text-[#171614]'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Orders ({orders.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('spices')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'spices'
                      ? 'bg-white text-[#171614] shadow-xs'
                      : 'text-[#5C5852] hover:text-[#171614]'
                  }`}
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>Spices &amp; Pictures ({liveSpices.length})</span>
                </button>

                {isMajorAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('payments')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === 'payments'
                        ? 'bg-white text-[#171614] shadow-xs'
                        : 'text-[#5C5852] hover:text-[#171614]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>+256 MoMo &amp; Airtel</span>
                  </button>
                )}

                {isMajorAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('team')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === 'team'
                        ? 'bg-white text-[#171614] shadow-xs'
                        : 'text-[#5C5852] hover:text-[#171614]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      Admins ({adminAccounts.length})
                      {pendingResetCount > 0 ? ` · ${pendingResetCount} Reset` : ''}
                    </span>
                  </button>
                )}

                {isMajorAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('inquiries')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === 'inquiries'
                        ? 'bg-white text-[#171614] shadow-xs'
                        : 'text-[#5C5852] hover:text-[#171614]'
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Inquiries ({inquiries.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('account')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'account'
                      ? 'bg-white text-[#171614] shadow-xs'
                      : 'text-[#5C5852] hover:text-[#171614]'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Password</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#171614] hover:text-white hover:bg-[#8C1D2F] border border-[#171614]/15 rounded-lg bg-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* TAB: STATISTICS & CASH INFLOW (MAJOR ADMIN ONLY) */}
          {activeTab === 'stats' && isMajorAdmin && (
            <section className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-[#171614]/8">
                  <div className="text-xs text-[#5C5852]">Total Cash Inflow (Active Orders)</div>
                  <div className="text-2xl font-semibold text-[#171614] mt-1.5 tabular-nums">
                    {formatUGX(stats.totalInflow)}
                  </div>
                  <div className="text-xs text-[#5C5852] mt-1 tabular-nums">
                    Across {stats.activeCount} non-cancelled orders
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#171614]/8">
                  <div className="text-xs text-[#5C5852]">Confirmed Cash Received</div>
                  <div className="text-2xl font-semibold text-[#8C1D2F] mt-1.5 tabular-nums">
                    {formatUGX(stats.confirmedInflow)}
                  </div>
                  <div className="text-xs text-[#5C5852] mt-1">
                    Verified MoMo / Airtel / Completed
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#171614]/8">
                  <div className="text-xs text-[#5C5852]">Pending Cash Inflow</div>
                  <div className="text-2xl font-semibold text-[#171614] mt-1.5 tabular-nums">
                    {formatUGX(stats.pendingInflow)}
                  </div>
                  <div className="text-xs text-[#5C5852] mt-1 tabular-nums">
                    {stats.pendingCount} pending/preparing orders
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#171614]/8">
                  <div className="text-xs text-[#5C5852]">Average Order Value</div>
                  <div className="text-2xl font-semibold text-[#171614] mt-1.5 tabular-nums">
                    {formatUGX(stats.averageOrder)}
                  </div>
                  <div className="text-xs text-[#5C5852] mt-1 tabular-nums">
                    {stats.totalOrders} total orders placed
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white rounded-xl border border-[#171614]/8 p-6 space-y-4">
                  <h2 className="font-display text-xl font-medium text-[#171614]">
                    Cash Inflow by Payment Channel
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: 'MTN MoMo (+256)', amount: stats.byPayment.momo },
                      { label: 'Airtel Pay (+256)', amount: stats.byPayment.airtel },
                      { label: 'Cash on Delivery / Pickup', amount: stats.byPayment.cod },
                    ].map((channel) => {
                      const pct =
                        stats.totalInflow > 0 ? Math.round((channel.amount / stats.totalInflow) * 100) : 0;
                      return (
                        <div key={channel.label} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-[#171614]">{channel.label}</span>
                            <span className="font-mono text-xs text-[#171614] tabular-nums">
                              {formatUGX(channel.amount)} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full bg-[#EFECE6] rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full bg-[#8C1D2F] rounded-full transition-all duration-300"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white rounded-xl border border-[#171614]/8 p-6 space-y-4">
                  <h2 className="font-display text-xl font-medium text-[#171614]">
                    Top Spices by Revenue
                  </h2>
                  {stats.topSpices.length === 0 ? (
                    <p className="text-sm text-[#5C5852]">
                      Spice sales rankings appear here once orders come in.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#171614]/8 text-sm">
                      {stats.topSpices.map((item) => (
                        <div key={item.name} className="py-3 flex items-center justify-between gap-4">
                          <div>
                            <div className="font-medium text-[#171614]">{item.name}</div>
                            <div className="text-xs text-[#5C5852] tabular-nums">
                              {item.units} jars sold
                            </div>
                          </div>
                          <div className="font-mono text-sm font-semibold text-[#171614] tabular-nums">
                            {formatUGX(item.revenue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* TAB: CUSTOMER ORDERS (MAJOR ADMIN ONLY) */}
          {activeTab === 'orders' && isMajorAdmin && (
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-medium text-[#171614]">
                  Customer Orders
                </h2>
                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EFECE6] rounded-lg">
                  {(['All', ...ORDER_STATUSES] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setOrderFilterStatus(status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
                        orderFilterStatus === status
                          ? 'bg-white text-[#171614] shadow-xs'
                          : 'text-[#5C5852] hover:text-[#171614]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-16 px-6 text-center bg-[#EFECE6]/60 rounded-xl border border-[#171614]/8 space-y-2">
                  <Clock className="w-6 h-6 mx-auto text-[#5C5852]" />
                  <h3 className="font-display text-xl text-[#171614]">No orders in this view</h3>
                  <p className="text-sm text-[#5C5852] max-w-md mx-auto">
                    Customer orders placed with MTN MoMo, Airtel Pay, or Cash on Delivery appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <article
                      key={order.docId}
                      className="bg-white rounded-xl border border-[#171614]/10 p-6 space-y-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#171614]/8">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-sm font-semibold text-[#171614] tabular-nums">
                              #{order.orderNumber}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-sm font-semibold text-[#171614]">
                              {order.customerName}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-xs text-[#5C5852]">
                              {formatTimestamp(order.createdAt)}
                            </span>
                          </div>
                          <div className="text-xs text-[#5C5852] flex flex-wrap items-center gap-3">
                            <span className="tabular-nums">{order.customerPhone}</span>
                            {order.customerEmail && <span>{order.customerEmail}</span>}
                            <span className="font-medium text-[#171614]">
                              {order.fulfillment === 'pickup'
                                ? 'Shop Pickup'
                                : `Delivery: ${order.deliveryAddress}`}
                            </span>
                          </div>
                          <div className="text-xs text-[#5C5852] flex flex-wrap items-center gap-3 pt-0.5">
                            <span className="font-semibold text-[#171614]">
                              Payment:{' '}
                              {order.paymentMethod === 'momo'
                                ? 'MTN MoMo'
                                : order.paymentMethod === 'airtel'
                                ? 'Airtel Pay'
                                : 'Cash on Delivery'}
                            </span>
                            {order.paymentPhone && (
                              <span className="font-mono tabular-nums">From: {order.paymentPhone}</span>
                            )}
                            {order.paymentReference && (
                              <span className="font-mono">Ref: {order.paymentReference}</span>
                            )}
                          </div>
                          {order.notes && (
                            <p className="text-xs text-[#8C1D2F] pt-1">Note: {order.notes}</p>
                          )}
                        </div>

                        <div className="text-right space-y-1.5">
                          <div className="text-lg font-semibold text-[#171614] tabular-nums">
                            {formatUGX(order.total)}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTogglePaymentConfirmed(order)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                              order.paymentConfirmed
                                ? 'bg-[#171614] text-white'
                                : 'bg-[#8C1D2F]/10 text-[#8C1D2F]'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>
                              {order.paymentConfirmed ? 'Payment Confirmed' : 'Confirm Payment'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        <ul className="lg:col-span-7 space-y-1.5 text-sm">
                          {order.items.map((item, idx) => (
                            <li key={`${item.spiceId}-${idx}`} className="flex justify-between gap-4 text-[#5C5852]">
                              <span>
                                <strong className="text-[#171614] tabular-nums">{item.quantity}×</strong>{' '}
                                {item.name} ({item.weightLabel})
                              </span>
                              <span className="tabular-nums text-[#171614]">
                                {formatUGX(item.unitPrice * item.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="lg:col-span-5 flex flex-wrap items-center justify-end gap-1.5">
                          {ORDER_STATUSES.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order, status)}
                              className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                                order.status === status
                                  ? 'bg-[#171614] text-white border-[#171614]'
                                  : 'bg-[#F8F7F4] text-[#5C5852] border-[#171614]/12 hover:text-[#171614]'
                              }`}
                            >
                              {status}
                            </button>
                          ))}

                          {confirmDeleteId === order.docId ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.docId)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#8C1D2F] rounded-md cursor-pointer whitespace-nowrap"
                            >
                              Confirm Delete
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(order.docId)}
                              aria-label={`Delete order ${order.orderNumber}`}
                              className="p-1.5 text-[#5C5852] hover:text-[#8C1D2F] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB: SPICES & PICTURES (ALL ADMINS) */}
          {activeTab === 'spices' && (
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-medium text-[#171614]">
                    Spices &amp; Product Photography
                  </h2>
                  <p className="text-sm text-[#5C5852]">
                    Upload photos from your device, paste image URLs, update UGX prices, or publish new spices.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSeedDefaultSpices}
                    disabled={isSeeding}
                    className="px-4 py-2 text-xs font-semibold text-[#171614] bg-[#EFECE6] hover:bg-[#E4DFD5] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isSeeding ? 'Syncing...' : 'Sync Starter Spices to Database'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewSpice(true);
                      setEditingSpice(createEmptySpiceForm());
                      setImageError(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#8C1D2F] hover:bg-[#731625] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Spice &amp; Picture</span>
                  </button>
                </div>
              </div>

              {spiceFeedback && (
                <div className="p-4 rounded-lg bg-white border border-[#8C1D2F]/25 text-sm text-[#171614] flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#8C1D2F]" />
                  <span>{spiceFeedback}</span>
                </div>
              )}

              {editingSpice && (
                <form
                  onSubmit={handleSaveSpice}
                  className="bg-white rounded-xl border border-[#171614]/15 p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#171614]/10">
                    <h3 className="font-display text-2xl font-medium text-[#171614]">
                      {isNewSpice ? 'Add New Spice' : `Edit ${editingSpice.name}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingSpice(null)}
                      className="text-xs font-medium text-[#5C5852] hover:text-[#171614] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-5 space-y-3">
                      <label className="block text-xs font-semibold text-[#171614]">
                        Spice Picture
                      </label>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#EFECE6] border border-[#171614]/10">
                        {editingSpice.image ? (
                          <SpiceImage
                            src={editingSpice.image}
                            alt={editingSpice.name || 'Spice preview'}
                            title={editingSpice.name || 'Preview'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-xs text-[#5C5852] p-4 text-center">
                            <ImagePlus className="w-6 h-6 mb-2 text-[#8C1D2F]" />
                            <span>Upload a photo or paste an image URL</span>
                          </div>
                        )}
                      </div>

                      <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#171614] bg-[#EFECE6] hover:bg-[#E4DFD5] rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Picture from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="sr-only"
                        />
                      </label>

                      <input
                        type="text"
                        value={editingSpice.image}
                        onChange={(e) => setEditingSpice({ ...editingSpice, image: e.target.value })}
                        placeholder="Or paste image URL (https://... or /src/assets/...)"
                        className="w-full px-3 py-2 text-xs bg-[#F8F7F4] border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                      />
                      {imageError && <p className="text-xs text-[#8C1D2F]">{imageError}</p>}
                    </div>

                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#171614] mb-1">
                          Spice Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingSpice.name}
                          onChange={(e) => setEditingSpice({ ...editingSpice, name: e.target.value })}
                          placeholder="e.g. Smoked Black Cardamom"
                          className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#171614] mb-1">
                          Botanical Name
                        </label>
                        <input
                          type="text"
                          value={editingSpice.botanicalName}
                          onChange={(e) =>
                            setEditingSpice({ ...editingSpice, botanicalName: e.target.value })
                          }
                          placeholder="e.g. Amomum subulatum"
                          className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#171614] mb-1">
                          Culinary Category
                        </label>
                        <select
                          value={editingSpice.category}
                          onChange={(e) =>
                            setEditingSpice({
                              ...editingSpice,
                              category: e.target.value as CulinaryCategory,
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                        >
                          {CATEGORIES.filter((c) => c !== 'All Spices').map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#171614] mb-1">
                          Grade
                        </label>
                        <input
                          type="text"
                          value={editingSpice.grade}
                          onChange={(e) => setEditingSpice({ ...editingSpice, grade: e.target.value })}
                          placeholder="Grade A1 Whole Pods"
                          className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-[#171614] mb-1">
                          Short Description *
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={editingSpice.shortDescription}
                          onChange={(e) =>
                            setEditingSpice({ ...editingSpice, shortDescription: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg resize-none"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          id="spice-in-stock"
                          type="checkbox"
                          checked={editingSpice.inStock}
                          onChange={(e) =>
                            setEditingSpice({ ...editingSpice, inStock: e.target.checked })
                          }
                          className="w-4 h-4 accent-[#8C1D2F]"
                        />
                        <label htmlFor="spice-in-stock" className="text-xs font-medium text-[#171614]">
                          In Stock &amp; Available for Ordering
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#171614]/10 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5C5852]">
                      Jar Weights &amp; Pricing (UGX)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {editingSpice.weightTiers.map((tier, idx) => (
                        <div key={idx} className="p-3 bg-[#F8F7F4] rounded-lg border border-[#171614]/10 space-y-2">
                          <input
                            type="text"
                            required
                            value={tier.label}
                            onChange={(e) => {
                              const next = [...editingSpice.weightTiers];
                              next[idx] = { ...next[idx], label: e.target.value };
                              setEditingSpice({ ...editingSpice, weightTiers: next });
                            }}
                            placeholder="Label (e.g. 50g Jar)"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#171614]/15 rounded"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              min={1}
                              required
                              value={tier.grams}
                              onChange={(e) => {
                                const next = [...editingSpice.weightTiers];
                                next[idx] = { ...next[idx], grams: Number(e.target.value) };
                                setEditingSpice({ ...editingSpice, weightTiers: next });
                              }}
                              placeholder="Grams"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#171614]/15 rounded tabular-nums"
                            />
                            <input
                              type="number"
                              min={500}
                              step="500"
                              required
                              value={tier.price}
                              onChange={(e) => {
                                const next = [...editingSpice.weightTiers];
                                next[idx] = { ...next[idx], price: Number(e.target.value) };
                                setEditingSpice({ ...editingSpice, weightTiers: next });
                              }}
                              placeholder="Price UGX"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#171614]/15 rounded tabular-nums"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingSpice(null)}
                      className="px-5 py-2.5 text-xs font-medium text-[#5C5852] hover:text-[#171614] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingSpice}
                      className="px-6 py-2.5 text-xs font-semibold text-white bg-[#8C1D2F] hover:bg-[#731625] rounded-lg transition-colors cursor-pointer"
                    >
                      {isSavingSpice ? 'Saving...' : 'Save Spice to Catalog'}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveSpices.map((spice) => (
                  <div
                    key={spice.id}
                    className="bg-white rounded-xl border border-[#171614]/10 overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] w-full bg-[#EFECE6] overflow-hidden">
                      <SpiceImage
                        src={spice.image}
                        alt={spice.imageAlt}
                        title={spice.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-xs text-[#8C1D2F] font-medium uppercase tracking-wider">
                          {spice.category}
                        </div>
                        <h3 className="font-display text-lg font-medium text-[#171614] mt-0.5">
                          {spice.name}
                        </h3>
                        <p className="text-xs text-[#5C5852] mt-1 tabular-nums">
                          From {formatUGX(spice.weightTiers[0]?.price ?? 0)} ·{' '}
                          {spice.inStock ? 'In Stock' : 'Out of Stock'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#171614]/8 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewSpice(false);
                            setEditingSpice(structuredClone(spice));
                            setImageError(null);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171614] bg-[#EFECE6] hover:bg-[#E4DFD5] rounded-md cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit / Picture</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <a
                            href={`#/spice/${spice.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#5C5852] hover:text-[#171614]"
                            title="Open public profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          {confirmDeleteId === spice.id ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteSpice(spice.id)}
                              className="px-2 py-1 text-xs font-semibold text-white bg-[#8C1D2F] rounded cursor-pointer"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(spice.id)}
                              aria-label={`Delete ${spice.name}`}
                              className="p-1 text-[#5C5852] hover:text-[#8C1D2F] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB: +256 PAYMENT NUMBERS (MAJOR ADMIN ONLY) */}
          {activeTab === 'payments' && isMajorAdmin && (
            <section className="max-w-2xl space-y-6">
              <div>
                <h2 className="font-display text-2xl font-medium text-[#171614]">
                  Mobile Money Receiving Numbers (+256)
                </h2>
                <p className="text-sm text-[#5C5852] mt-1">
                  Configure the +256 MTN MoMo and Airtel Pay numbers shown to customers during online checkout.
                </p>
              </div>

              <form
                onSubmit={handleSavePaymentSettings}
                className="bg-white rounded-xl border border-[#171614]/10 p-6 sm:p-8 space-y-6"
              >
                <div className="space-y-4 pb-6 border-b border-[#171614]/10">
                  <h3 className="text-sm font-semibold text-[#171614]">MTN MoMo (+256)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#5C5852] mb-1">
                        MTN MoMo Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        placeholder="+256 772 ..."
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#5C5852] mb-1">
                        Registered Account / Merchant Name
                      </label>
                      <input
                        type="text"
                        required
                        value={momoName}
                        onChange={(e) => setMomoName(e.target.value)}
                        placeholder="One Spice"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#171614]">Airtel Pay (+256)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#5C5852] mb-1">
                        Airtel Money / Merchant Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={airtelNumber}
                        onChange={(e) => setAirtelNumber(e.target.value)}
                        placeholder="+256 752 ..."
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#5C5852] mb-1">
                        Registered Account / Merchant Name
                      </label>
                      <input
                        type="text"
                        required
                        value={airtelName}
                        onChange={(e) => setAirtelName(e.target.value)}
                        placeholder="One Spice"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {paymentFeedback && (
                  <p className="text-xs font-medium text-[#8C1D2F]">{paymentFeedback}</p>
                )}

                <button
                  type="submit"
                  disabled={paymentSaving}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#8C1D2F] hover:bg-[#731625] rounded-lg transition-colors cursor-pointer"
                >
                  {paymentSaving ? 'Saving Numbers...' : 'Save Payment Numbers'}
                </button>
              </form>
            </section>
          )}

          {/* TAB: ADMIN TEAM & SECURITY (MAJOR ADMIN ONLY) */}
          {activeTab === 'team' && isMajorAdmin && (
            <section className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Add Admin / Major Admin Form */}
                <form
                  onSubmit={handleAddAdmin}
                  className="lg:col-span-5 bg-white rounded-xl border border-[#171614]/10 p-6 space-y-4"
                >
                  <div>
                    <h2 className="font-display text-xl font-medium text-[#171614]">
                      Add Admin or Major Admin
                    </h2>
                    <p className="text-xs text-[#5C5852] mt-1">
                      Create an account with their Gmail and an initial password they can change later.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#171614] mb-1">
                      Gmail Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="colleague@gmail.com"
                      className="w-full px-3.5 py-2 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#171614] mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="Team Member Name"
                      className="w-full px-3.5 py-2 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#171614] mb-1">
                      Initial Password (min 6 chars) *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Create starter password"
                      className="w-full px-3.5 py-2 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#171614] mb-1">
                      Role Permission
                    </label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                      className="w-full px-3.5 py-2 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                    >
                      <option value="admin">Standard Admin (Post &amp; Edit Spices Only)</option>
                      <option value="major_admin">Major Admin (Full Stats, Orders, Payments &amp; Team)</option>
                    </select>
                  </div>

                  {teamError && <p className="text-xs text-[#8C1D2F]">{teamError}</p>}
                  {teamFeedback && <p className="text-xs text-[#171614] font-medium">{teamFeedback}</p>}

                  <button
                    type="submit"
                    disabled={teamBusy}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#8C1D2F] hover:bg-[#731625] rounded-lg transition-colors cursor-pointer"
                  >
                    {teamBusy ? 'Creating Admin...' : 'Add Admin Account'}
                  </button>
                </form>

                {/* Admin Directory & Global Sign Out */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-xl border border-[#171614]/10 p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="font-display text-xl font-medium text-[#171614]">
                          Authorized Admins
                        </h2>
                        <p className="text-xs text-[#5C5852]">
                          Only listed Gmails can access the One Spice Admin Panel.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignOutAllAdmins}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#8C1D2F] bg-[#8C1D2F]/8 hover:bg-[#8C1D2F]/15 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out All Admins</span>
                      </button>
                    </div>

                    <div className="divide-y divide-[#171614]/8">
                      {adminAccounts.map((acc) => {
                        const isPrimary = isBootstrappedMajorAdminEmail(acc.email);
                        return (
                          <div
                            key={acc.docId}
                            className="py-3.5 flex flex-wrap items-center justify-between gap-3"
                          >
                            <div>
                              <div className="text-sm font-semibold text-[#171614]">
                                {acc.displayName}
                              </div>
                              <div className="text-xs text-[#5C5852] flex items-center gap-2">
                                <span>{acc.email}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-[#8C1D2F]">
                                  {acc.role === 'major_admin' ? 'Major Admin' : 'Spice Admin'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {!isPrimary && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAdminRole(acc)}
                                    className="px-2.5 py-1.5 text-xs font-medium bg-[#EFECE6] hover:bg-[#E4DFD5] text-[#171614] rounded-md cursor-pointer whitespace-nowrap"
                                  >
                                    {acc.role === 'major_admin' ? 'Set Spice Admin' : 'Make Major Admin'}
                                  </button>
                                  {confirmDeleteId === acc.docId ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAdmin(acc)}
                                      className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#8C1D2F] rounded-md cursor-pointer"
                                    >
                                      Confirm Remove
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(acc.docId)}
                                      aria-label={`Remove ${acc.email}`}
                                      className="p-1.5 text-[#5C5852] hover:text-[#8C1D2F] cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                              {isPrimary && (
                                <span className="text-xs font-mono text-[#5C5852]">Primary Owner</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Password Reset Requests from Admins */}
                  <div className="bg-white rounded-xl border border-[#171614]/10 p-6 space-y-4">
                    <h3 className="font-display text-xl font-medium text-[#171614]">
                      Password Reset Requests
                    </h3>
                    {resetRequests.length === 0 ? (
                      <p className="text-xs text-[#5C5852]">No password recovery requests pending.</p>
                    ) : (
                      <div className="divide-y divide-[#171614]/8">
                        {resetRequests.map((req) => (
                          <div
                            key={req.docId}
                            className="py-3 flex flex-wrap items-center justify-between gap-3"
                          >
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium text-[#171614]">{req.email}</div>
                              <div className="text-xs text-[#5C5852]">
                                {req.note} · {formatTimestamp(req.createdAt)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleMajorAdminSendResetEmail(req)}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#8C1D2F] hover:bg-[#731625] rounded-md cursor-pointer whitespace-nowrap"
                              >
                                Send Recovery Email
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResolveResetRequest(req)}
                                className="px-2.5 py-1.5 text-xs font-medium bg-[#EFECE6] text-[#171614] rounded-md cursor-pointer"
                              >
                                {req.status}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB: CUSTOMER INQUIRIES (MAJOR ADMIN ONLY) */}
          {activeTab === 'inquiries' && isMajorAdmin && (
            <section className="space-y-4">
              {inquiries.length === 0 ? (
                <div className="py-16 px-6 text-center bg-[#EFECE6]/60 rounded-xl border border-[#171614]/8 space-y-2">
                  <Mail className="w-6 h-6 mx-auto text-[#5C5852]" />
                  <h2 className="font-display text-xl text-[#171614]">No inquiries yet</h2>
                  <p className="text-sm text-[#5C5852]">
                    Messages sent from the Visit &amp; Contact page appear here automatically.
                  </p>
                </div>
              ) : (
                inquiries.map((inq) => (
                  <article
                    key={inq.docId}
                    className="bg-white rounded-xl border border-[#171614]/10 p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5852]">
                        <span className="font-semibold text-[#171614]">{inq.name}</span>
                        <span aria-hidden="true">·</span>
                        <span>{inq.email}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#8C1D2F] font-medium">{inq.topic}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatTimestamp(inq.createdAt)}</span>
                      </div>
                      <p className="text-sm text-[#171614] leading-relaxed">{inq.message}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.topic)}`}
                        className="px-3 py-1.5 text-xs font-medium text-[#171614] bg-[#EFECE6] hover:bg-[#E4DFD5] rounded-md whitespace-nowrap"
                      >
                        Reply via Email
                      </a>
                      <button
                        type="button"
                        onClick={() => handleToggleInquiryStatus(inq)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap ${
                          inq.status === 'Replied'
                            ? 'bg-[#171614] text-white'
                            : 'bg-[#8C1D2F]/10 text-[#8C1D2F]'
                        }`}
                      >
                        {inq.status}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>
          )}

          {/* TAB: ACCOUNT & CHANGE PASSWORD (ALL ADMINS) */}
          {activeTab === 'account' && (
            <section className="max-w-lg space-y-6">
              <div>
                <h2 className="font-display text-2xl font-medium text-[#171614]">
                  Account &amp; Password
                </h2>
                <p className="text-sm text-[#5C5852] mt-1">
                  Update your One Spice admin password anytime or sign out.
                </p>
              </div>

              <form
                onSubmit={handleChangeOwnPassword}
                className="bg-white rounded-xl border border-[#171614]/10 p-6 space-y-4"
              >
                {user.providerData.some((p) => p.providerId === 'password') && (
                  <div>
                    <label className="block text-xs font-medium text-[#171614] mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-[#171614] mb-1">
                    New Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newOwnPassword}
                    onChange={(e) => setNewOwnPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#171614]/15 rounded-lg"
                  />
                </div>

                {passwordError && <p className="text-xs text-[#8C1D2F]">{passwordError}</p>}
                {passwordFeedback && (
                  <p className="text-xs font-medium text-[#171614]">{passwordFeedback}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#8C1D2F] hover:bg-[#731625] rounded-lg transition-colors cursor-pointer"
                  >
                    Update My Password
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#171614] bg-[#EFECE6] hover:bg-[#E4DFD5] rounded-lg cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
