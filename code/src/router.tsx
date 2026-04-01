import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./shell/AppShell";
import { ProtectedLayout } from "./shell/ProtectedLayout";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: "/",
        lazy: async () => {
          const { HomePage } = await import("./views/HomePage");
          return { Component: HomePage };
        }
      },
      {
        path: "/login",
        lazy: async () => {
          const { LoginPage } = await import("./views/LoginPage");
          return { Component: LoginPage };
        }
      },
      {
        path: "/signup",
        lazy: async () => {
          const { SignupPage } = await import("./views/SignupPage");
          return { Component: SignupPage };
        }
      },
      {
        path: "/creators/:slug",
        lazy: async () => {
          const { PublicProfilePage } = await import("./views/PublicProfilePage");
          return { Component: PublicProfilePage };
        }
      },
      {
        path: "/profiles/:id",
        lazy: async () => {
          const { PublicProfilePage } = await import("./views/PublicProfilePage");
          return { Component: PublicProfilePage };
        }
      },
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "/feed",
            lazy: async () => {
              const { FeedPage } = await import("./views/FeedPage");
              return { Component: FeedPage };
            }
          },
          {
            path: "/dashboard",
            lazy: async () => {
              const { DashboardPage } = await import("./views/DashboardPage");
              return { Component: DashboardPage };
            }
          },
          {
            path: "/messages",
            lazy: async () => {
              const { MessagesPage } = await import("./views/MessagesPage");
              return { Component: MessagesPage };
            }
          },
          {
            path: "/notifications",
            lazy: async () => {
              const { NotificationsPage } = await import("./views/NotificationsPage");
              return { Component: NotificationsPage };
            }
          }
        ]
      }
    ]
  },
  {
    path: "*",
    lazy: async () => {
      const { NotFoundPage } = await import("./views/NotFoundPage");
      return { Component: NotFoundPage };
    }
  }
]);
