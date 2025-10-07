import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Profile, Milestone, AppNotification, StoredDoc, ActivityEntry, ChatThread } from "@/types";
import { seedMilestones, seedNotifications, seedDocuments, seedActivities, seedChatThreads } from "@/data/seed";

interface AppState {
  profile: Profile | null;
  milestones: Milestone[];
  notifications: AppNotification[];
  documents: StoredDoc[];
  activities: ActivityEntry[];
  chatThreads: ChatThread[];
  onboardingComplete: boolean;
}

type AppAction =
  | { type: "SET_PROFILE"; payload: Profile }
  | { type: "UPDATE_MILESTONE"; payload: Milestone }
  | { type: "UPDATE_STEP"; payload: { milestoneId: string; stepId: string; done: boolean } }
  | { type: "ADD_NOTIFICATION"; payload: AppNotification }
  | { type: "UPDATE_NOTIFICATION"; payload: AppNotification }
  | { type: "DELETE_NOTIFICATION"; payload: string }
  | { type: "SNOOZE_NOTIFICATION"; payload: { id: string; until: string } }
  | { type: "ADD_DOCUMENT"; payload: StoredDoc }
  | { type: "UPDATE_DOCUMENT"; payload: StoredDoc }
  | { type: "DELETE_DOCUMENT"; payload: string }
  | { type: "ADD_ACTIVITY"; payload: ActivityEntry }
  | { type: "ADD_CHAT_THREAD"; payload: ChatThread }
  | { type: "UPDATE_CHAT_THREAD"; payload: ChatThread }
  | { type: "DELETE_CHAT_THREAD"; payload: string }
  | { type: "COMPLETE_ONBOARDING"; payload: { profile: Profile; milestones: Milestone[] } };

const initialState: AppState = {
  profile: null,
  milestones: seedMilestones,
  notifications: seedNotifications,
  documents: seedDocuments,
  activities: seedActivities,
  chatThreads: seedChatThreads,
  onboardingComplete: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_PROFILE":
      return { ...state, profile: action.payload };

    case "UPDATE_MILESTONE":
      return {
        ...state,
        milestones: state.milestones.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      };

    case "UPDATE_STEP": {
      const { milestoneId, stepId, done } = action.payload;
      return {
        ...state,
        milestones: state.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          const updatedSteps = m.steps.map((s) =>
            s.id === stepId ? { ...s, done } : s
          );
          const completedSteps = updatedSteps.filter((s) => s.done).length;
          const progress = Math.round((completedSteps / updatedSteps.length) * 100);
          const status = progress === 100 ? "completed" : progress > 0 ? "active" : m.status;
          return { ...m, steps: updatedSteps, progress, status };
        }),
      };
    }

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case "UPDATE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? action.payload : n
        ),
      };

    case "DELETE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };

    case "SNOOZE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? { ...n, snoozedUntil: action.payload.until } : n
        ),
      };

    case "ADD_DOCUMENT":
      return {
        ...state,
        documents: [action.payload, ...state.documents],
      };

    case "UPDATE_DOCUMENT":
      return {
        ...state,
        documents: state.documents.map((d) =>
          d.id === action.payload.id ? action.payload : d
        ),
      };

    case "DELETE_DOCUMENT":
      return {
        ...state,
        documents: state.documents.filter((d) => d.id !== action.payload),
      };

    case "ADD_ACTIVITY":
      return {
        ...state,
        activities: [action.payload, ...state.activities],
      };

    case "ADD_CHAT_THREAD":
      return {
        ...state,
        chatThreads: [action.payload, ...state.chatThreads],
      };

    case "UPDATE_CHAT_THREAD":
      return {
        ...state,
        chatThreads: state.chatThreads.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case "DELETE_CHAT_THREAD":
      return {
        ...state,
        chatThreads: state.chatThreads.filter((t) => t.id !== action.payload),
      };

    case "COMPLETE_ONBOARDING":
      return {
        ...state,
        profile: action.payload.profile,
        milestones: action.payload.milestones,
        onboardingComplete: true,
      };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
