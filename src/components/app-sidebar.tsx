"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Calendar, 
  Home, 
  Settings, 
  BarChart3, 
  Plus, 
  FileText, 
  Clock, 
  Users, 
  Sparkles,
  Linkedin,
  Menu,
  Search,
  Edit3,
  Save
} from "lucide-react"
import { useLinkedInOAuth } from "@/hooks/use-linkedin-oauth"
import { useAuthStore } from "@/lib/auth-store"
import { usePostCounts } from "@/hooks/use-post-counts"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

// Menu items for the sidebar
const mainMenuItems = [
  {
    title: "Create Post",
    url: "/dashboard/create",
    icon: Plus,
  },
  {
    title: "Editor",
    url: "/dashboard/editor",
    icon: Edit3,
  },
  {
    title: "Calendar",
    url: "/dashboard/calendar",
    icon: Calendar,
  }
]

export function AppSidebar() {
  const pathname = usePathname()
  const { oauthData } = useLinkedInOAuth()
  const { user } = useAuthStore()
  const { counts, isLoading } = usePostCounts()

  const contentMenuItems = [
    {
      title: "All Posts",
      url: "/dashboard/posts",
      icon: FileText,
      badge: isLoading ? "..." : counts.all > 0 ? counts.all.toString() : undefined,
    },
    {
      title: "Scheduled",
      url: "/dashboard/scheduled",
      icon: Clock,
      badge: isLoading ? "..." : counts.scheduled > 0 ? counts.scheduled.toString() : undefined,
    },
    {
      title: "Drafts",
      url: "/dashboard/drafts",
      icon: Save,
      badge: isLoading ? "..." : counts.draft > 0 ? counts.draft.toString() : undefined,
    },
  ]

  const settingsMenuItems = [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "LinkedIn",
      url: "/dashboard/linkedin",
      icon: Linkedin,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">PostGenius</span>
            <span className="text-xs text-muted-foreground">AI Content Creator</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {oauthData?.profile?.profilePicture ? (
              <img 
                src={oauthData.profile.profilePicture} 
                alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Users className="h-4 w-4" />
              </div>
            )}
            <div className="flex flex-col overflow-hidden flex-1 min-w-0">
              <span className="text-sm font-medium truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : "Guest User"
                }
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.email || "User"}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <ThemeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 