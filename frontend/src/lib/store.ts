import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "customer" | "admin";

export type User = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: UserRole;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
};

export type RequestStatus = "submitted" | "assessed" | "in_progress" | "completed";

export type ServiceRequest = {
  id: string;
  user_id: string;
  service_id: string;
  property_type: string;
  location: string;
  preferred_date: string;
  notes: string;
  status: RequestStatus;
  created_at: string;
};

type AppState = {
  user: User | null;
  users: User[];
  services: Service[];
  requests: ServiceRequest[];
  
  // Actions
  login: (mobile: string, passwordHash: string) => boolean;
  register: (user: Omit<User, "id">, passwordHash: string) => boolean;
  logout: () => void;
  addRequest: (request: Omit<ServiceRequest, "id" | "created_at" | "status">) => string;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
  updateServices: (services: Service[]) => void;
};

// Initial mock data
const MOCK_SERVICES: Service[] = [
  { id: "s1", name: "Assessment & Condition Survey", description: "Comprehensive analysis of structural health.", icon: "ClipboardCheck", is_active: true },
  { id: "s2", name: "Investigation & Analysis", description: "Deep-dive diagnostic testing and reporting.", icon: "Search", is_active: true },
  { id: "s3", name: "Repair & Rehabilitation", description: "Expert structural restoration services.", icon: "Wrench", is_active: true },
  { id: "s4", name: "Retrofitting & Strengthening", description: "Upgrading structures for modern demands.", icon: "Shield", is_active: true },
  { id: "s5", name: "Waterproofing & Protection", description: "Advanced systems to prevent water ingress.", icon: "HomeIcon", is_active: true },
  { id: "s6", name: "Project Management", description: "End-to-end execution of repair projects.", icon: "LineChart", is_active: true },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [
        { id: "admin-1", name: "Admin", mobile: "1234567890", email: "admin@rehabtechnologies.com", role: "admin" },
        // mock password hash for both is "password123" -> hashed logically for mock
      ],
      services: MOCK_SERVICES,
      requests: [],

      login: (mobile, passwordHash) => {
        const user = get().users.find((u) => u.mobile === mobile);
        // We bypass real password validation in this mock, assuming the UI checks it or we just trust the mock
        if (user) {
          set({ user });
          return true;
        }
        return false;
      },

      register: (userData, passwordHash) => {
        if (get().users.some(u => u.mobile === userData.mobile)) {
          return false; // User exists
        }
        const newUser: User = { ...userData, id: `u-${Date.now()}` };
        set((state) => ({ users: [...state.users, newUser], user: newUser }));
        return true;
      },

      logout: () => set({ user: null }),

      addRequest: (reqData) => {
        const id = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newReq: ServiceRequest = {
          ...reqData,
          id,
          status: "submitted",
          created_at: new Date().toISOString(),
        };
        set((state) => ({ requests: [newReq, ...state.requests] }));
        return id;
      },

      updateRequestStatus: (id, status) => {
        set((state) => ({
          requests: state.requests.map((r) => r.id === id ? { ...r, status } : r)
        }));
      },

      updateServices: (services) => set({ services }),
    }),
    {
      name: "rehab-tech-storage",
    }
  )
);
