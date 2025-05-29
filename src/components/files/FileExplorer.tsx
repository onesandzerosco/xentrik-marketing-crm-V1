import React from 'react';
import { FileExplorerModals } from './explorer/FileExplorerModals';
import { useFileExplorer } from './explorer/useFileExplorer';
import { useFolderModals } from './explorer/hooks/useFolderModals';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2, Plus, FolderPlus, Folder, Tag, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarItem,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  AspectRatio,
} from "@/components/ui/aspect-ratio"
import {
  Skeleton,
} from "@/components/ui/skeleton"
import {
  Switch,
} from "@/components/ui/switch"
import {
  Textarea,
} from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import {
  Progress,
} from "@/components/ui/progress"
import {
  Calendar,
} from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Resizable,
} from "@/components/ui/resizable"
import {
  CommandDialog,
} from "@/components/ui/command"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Slider,
} from "@/components/ui/slider"
import {
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
  DialogDescription as AlertDialogDescription,
  DialogContent as AlertDialogContent,
  DialogFooter as AlertDialogFooter,
  DialogClose as AlertDialogClose,
  DialogCancel as AlertDialogCancel,
  DialogTrigger as AlertDialogTrigger,
  DialogAction as AlertDialogAction,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenuCheckboxItem,
} from "@/components/ui/context-menu"
import {
  HoverCard as ActionHoverCard,
  HoverCardContent as ActionHoverCardContent,
  HoverCardTrigger as ActionHoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Command as ActionCommand,
  CommandEmpty as ActionCommandEmpty,
  CommandGroup as ActionCommandGroup,
  CommandInput as ActionCommandInput,
  CommandItem as ActionCommandItem,
  CommandList as ActionCommandList,
  CommandSeparator as ActionCommandSeparator,
  CommandShortcut as ActionCommandShortcut,
} from "@/components/ui/command"
import {
  NavigationMenu as ActionNavigationMenu,
  NavigationMenuContent as ActionNavigationMenuContent,
  NavigationMenuItem as ActionNavigationMenuItem,
  NavigationMenuLink as ActionNavigationMenuLink,
  NavigationMenuList as ActionNavigationMenuList,
  NavigationMenuTrigger as ActionNavigationMenuTrigger,
  NavigationMenuViewport as ActionNavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import {
  Sheet as ActionSheet,
  SheetClose as ActionSheetClose,
  SheetContent as ActionSheetContent,
  SheetDescription as ActionSheetDescription,
  SheetFooter as ActionSheetFooter,
  SheetHeader as ActionSheetHeader,
  SheetTitle as ActionSheetTitle,
  SheetTrigger as ActionSheetTrigger,
} from "@/components/ui/sheet"
import {
  Collapsible as ActionCollapsible,
  CollapsibleContent as ActionCollapsibleContent,
  CollapsibleTrigger as ActionCollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenu as ActionContextMenu,
  ContextMenuContent as ActionContextMenuContent,
  ContextMenuItem as ActionContextMenuItem,
  ContextMenuSeparator as ActionContextMenuSeparator,
  ContextMenuTrigger as ActionContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog as ActionDialog,
  DialogHeader as ActionDialogHeader,
  DialogTitle as ActionDialogTitle,
  DialogDescription as ActionDialogDescription,
  DialogContent as ActionDialogContent,
  DialogFooter as ActionDialogFooter,
  DialogClose as ActionDialogClose,
  DialogCancel as ActionDialogCancel,
  DialogTrigger as ActionDialogTrigger,
  DialogAction as ActionDialogAction,
} from "@/components/ui/dialog"
import {
  AlertDialog as ActionAlertDialog,
  AlertDialogHeader as ActionAlertDialogHeader,
  AlertDialogTitle as ActionAlertDialogTitle,
  AlertDialogDescription as ActionAlertDialogDescription,
  AlertDialogContent as ActionAlertDialogContent,
  AlertDialogFooter as ActionAlertDialogFooter,
  AlertDialogClose as ActionAlertDialogClose,
  AlertDialogCancel as ActionAlertDialogCancel,
  AlertDialogTrigger as ActionAlertDialogTrigger,
  AlertDialogAction as ActionAlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu as ActionDropdownMenu,
  DropdownMenuContent as ActionDropdownMenuContent,
  DropdownMenuItem as ActionDropdownMenuItem,
  DropdownMenuLabel as ActionDropdownMenuLabel,
  DropdownMenuSeparator as ActionDropdownMenuSeparator,
  DropdownMenuTrigger as ActionDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card as ActionCard,
  CardContent as ActionCardContent,
  CardDescription as ActionCardDescription,
  CardFooter as ActionCardFooter,
  CardHeader as ActionCardHeader,
  CardTitle as ActionCardTitle,
} from "@/components/ui/card"
import {
  Popover as ActionPopover,
  PopoverContent as ActionPopoverContent,
  PopoverTrigger as ActionPopoverTrigger,
} from "@/components/ui/popover"
import {
  Table as ActionTable,
  TableBody as ActionTableBody,
  TableCaption as ActionTableCaption,
  TableCell as ActionTableCell,
  TableHead as ActionTableHead,
  TableFooter as ActionTableFooter,
  TableHeader as ActionTableHeader,
  TableRow as ActionTableRow,
} from "@/components/ui/table"
import {
  Tooltip as ActionTooltip,
  TooltipContent as ActionTooltipContent,
  TooltipProvider as ActionTooltipProvider,
  TooltipTrigger as ActionTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Menubar as ActionMenubar,
  MenubarContent as ActionMenubarContent,
  MenubarMenu as ActionMenubarMenu,
  MenubarItem as ActionMenubarItem,
  MenubarSeparator as ActionMenubarSeparator,
  MenubarTrigger as ActionMenubarTrigger,
} from "@/components/ui/menubar"
import {
  CommandDialog as ActionCommandDialog,
} from "@/components/ui/command"
import {
  Drawer as ActionDrawer,
  DrawerClose as ActionDrawerClose,
  DrawerContent as ActionDrawerContent,
  DrawerDescription as ActionDrawerDescription,
  DrawerFooter as ActionDrawerFooter,
  DrawerHeader as ActionDrawerHeader,
  DrawerTitle as ActionDrawerTitle,
  DrawerTrigger as ActionDrawerTrigger,
} from "@/components/ui/drawer"
import {
  AspectRatio as ActionAspectRatio,
} from "@/components/ui/aspect-ratio"
import {
  Skeleton as ActionSkeleton,
} from "@/components/ui/skeleton"
import {
  Switch as ActionSwitch,
} from "@/components/ui/switch"
import {
  Textarea as ActionTextarea,
} from "@/components/ui/textarea"
import {
  Select as ActionSelect,
  SelectContent as ActionSelectContent,
  SelectItem as ActionSelectItem,
  SelectTrigger as ActionSelectTrigger,
  SelectValue as ActionSelectValue,
} from "@/components/ui/select"
import {
  RadioGroup as ActionRadioGroup,
  RadioGroupItem as ActionRadioGroupItem,
} from "@/components/ui/radio-group"
import {
  Progress as ActionProgress,
} from "@/components/ui/progress"
import {
  Calendar as ActionCalendar,
} from "@/components/ui/calendar"
import {
  Form as ActionForm,
  FormControl as ActionFormControl,
  FormDescription as ActionFormDescription,
  FormField as ActionFormField,
  FormItem as ActionFormItem,
  FormLabel as ActionFormLabel,
  FormMessage as ActionFormMessage,
} from "@/components/ui/form"
import {
  Slider as ActionSlider,
} from "@/components/ui/slider"
import {
  Resizable as ActionResizable,
} from "@/components/ui/resizable"
import {
  ResizableHandle as ActionResizableHandle,
  ResizablePanel as ActionResizablePanel,
  ResizablePanelGroup as ActionResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  DropdownMenuCheckboxItem as ActionDropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Command as FileCommand,
  CommandEmpty as FileCommandEmpty,
  CommandGroup as FileCommandGroup,
  CommandInput as FileCommandInput,
  CommandItem as FileCommandItem,
  CommandList as FileCommandList,
  CommandSeparator as FileCommandSeparator,
  CommandShortcut as FileCommandShortcut,
} from "@/components/ui/command"
import {
  NavigationMenu as FileNavigationMenu,
  NavigationMenuContent as FileNavigationMenuContent,
  NavigationMenuItem as FileNavigationMenuItem,
  NavigationMenuLink as FileNavigationMenuLink,
  NavigationMenuList as FileNavigationMenuList,
  NavigationMenuTrigger as FileNavigationMenuTrigger,
  NavigationMenuViewport as FileNavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import {
  Sheet as FileSheet,
  SheetClose as FileSheetClose,
  SheetContent as FileSheetContent,
  SheetDescription as FileSheetDescription,
  SheetFooter as FileSheetFooter,
  SheetHeader as FileSheetHeader,
  SheetTitle as FileSheetTitle,
  SheetTrigger as FileSheetTrigger,
} from "@/components/ui/sheet"
import {
  Collapsible as FileCollapsible,
  CollapsibleContent as FileCollapsibleContent,
  CollapsibleTrigger as FileCollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenu as FileContextMenu,
  ContextMenuContent as FileContextMenuContent,
  ContextMenuItem as FileContextMenuItem,
  ContextMenuSeparator as FileContextMenuSeparator,
  ContextMenuTrigger as FileContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog as FileDialog,
  DialogHeader as FileDialogHeader,
  DialogTitle as FileDialogTitle,
  DialogDescription as FileDialogDescription,
  DialogContent as FileDialogContent,
  DialogFooter as FileDialogFooter,
  DialogClose as FileDialogClose,
  DialogCancel as FileDialogCancel,
  DialogTrigger as FileDialogTrigger,
  DialogAction as FileDialogAction,
} from "@/components/ui/dialog"
import {
  AlertDialog as FileAlertDialog,
  AlertDialogHeader as FileAlertDialogHeader,
  AlertDialogTitle as FileAlertDialogTitle,
  AlertDialogDescription as FileAlertDialogDescription,
  AlertDialogContent as FileAlertDialogContent,
  AlertDialogFooter as FileAlertDialogFooter,
  AlertDialogClose as FileAlertDialogClose,
  AlertDialogCancel as FileAlertDialogCancel,
  AlertDialogTrigger as FileAlertDialogTrigger,
  AlertDialogAction as FileAlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu as FileDropdownMenu,
  DropdownMenuContent as FileDropdownMenuContent,
  DropdownMenuItem as FileDropdownMenuItem,
  DropdownMenuLabel as FileDropdownMenuLabel,
  DropdownMenuSeparator as FileDropdownMenuSeparator,
  DropdownMenuTrigger as FileDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card as FileCard,
  CardContent as FileCardContent,
  CardDescription as FileCardDescription,
  CardFooter as FileCardFooter,
  CardHeader as FileCardHeader,
  CardTitle as FileCardTitle,
} from "@/components/ui/card"
import {
  Popover as FilePopover,
  PopoverContent as FilePopoverContent,
  PopoverTrigger as FilePopoverTrigger,
} from "@/components/ui/popover"
import {
  Table as FileTable,
  TableBody as FileTableBody,
  TableCaption as FileTableCaption,
  TableCell as FileTableCell,
  TableHead as FileTableHead,
  TableFooter as FileTableFooter,
  TableHeader as FileTableHeader,
  TableRow as FileTableRow,
} from "@/components/ui/table"
import {
  Tooltip as FileTooltip,
  TooltipContent as FileTooltipContent,
  TooltipProvider as FileTooltipProvider,
  TooltipTrigger as FileTooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Menubar as FileMenubar,
  MenubarContent as FileMenubarContent,
  MenubarMenu as FileMenubarMenu,
  MenubarItem as FileMenubarItem,
  MenubarSeparator as FileMenubarSeparator,
  MenubarTrigger as FileMenubarTrigger,
} from "@/components/ui/menubar"
import {
  CommandDialog as FileCommandDialog,
} from "@/components/ui/command"
import {
  Drawer as FileDrawer,
  DrawerClose as FileDrawerClose,
  DrawerContent as FileDrawerContent,
  DrawerDescription as FileDrawerDescription,
  DrawerFooter as FileDrawerFooter,
  DrawerHeader as FileDrawerHeader,
  DrawerTitle as FileDrawerTitle,
  DrawerTrigger as FileDrawerTrigger,
} from "@/components/ui/drawer"
import {
  AspectRatio as FileAspectRatio,
} from "@/components/ui/aspect-ratio"
import {
  Skeleton as FileSkeleton,
} from "@/components/ui/skeleton"
import {
  Switch as FileSwitch,
} from "@/components/ui/switch"
import {
  Textarea as FileTextarea,
} from "@/components/ui/textarea"
import {
  Select as FileSelect,
  SelectContent as FileSelectContent,
  SelectItem as FileSelectItem,
  SelectTrigger as FileSelectTrigger,
  SelectValue as FileSelectValue,
} from "@/components/ui/select"
import {
  RadioGroup as FileRadioGroup,
  RadioGroupItem as FileRadioGroupItem,
} from "@/components/ui/radio-group"
import {
  Progress as FileProgress,
} from "@/components/ui/progress"
import {
  Calendar as FileCalendar,
} from "@/components/ui/calendar"
import {
  Form as FileForm,
  FormControl as FileFormControl,
  FormDescription as FileFormDescription,
  FormField as FileFormField,
  FormItem as FileFormItem,
  FormLabel as FileFormLabel,
  FormMessage as FileFormMessage,
} from "@/components/ui/form"
import {
  Slider as FileSlider,
} from "@/components/ui/slider"
import {
  Resizable as FileResizable,
} from "@/components/ui/resizable"
import {
  ResizableHandle as FileResizableHandle,
  ResizablePanel as FileResizablePanel,
  ResizablePanelGroup as FileResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  DropdownMenuCheckboxItem as FileDropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  currentCategory: string | null;
  availableFolders: Folder[];
  availableCategories: Category[];
  isCreatorView?: boolean;
  onUploadComplete?: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds?: string[];
  onCreateFolder: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory: (categoryName: string) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string, categoryId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newName: string) => Promise<void>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  onFolderChange,
  currentFolder,
  onCategoryChange,
  currentCategory,
  availableFolders,
  availableCategories,
  isCreatorView = false,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds = [],
  onCreateFolder,
  onCreateCategory,
  onAddFilesToFolder,
  onDeleteFolder,
  onDeleteCategory,
  onRemoveFromFolder,
  onRenameFolder,
  onRenameCategory
}) => {
  const {
    selectedFileIds,
    setSelectedFileIds,
    handleFileDeleted,
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    isCreateFolderModalOpen,
    setIsCreateFolderModalOpen,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isDeleteFolderModalOpen,
    setIsDeleteFolderModalOpen,
    isDeleteCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    isFileNoteModalOpen,
    setIsFileNoteModalOpen,
    handleAddToFolderClick,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    handleEditNote,
    fileToEdit,
    setFileToEdit,
    filteredFiles,
    selectedTags, 
    setSelectedTags,
    availableTags,
    onTagCreate,
    handleAddTagClick,
    handleAddTagToFile,
    isAddTagModalOpen,
    setIsAddTagModalOpen,
    onAddTagToFiles,
    onRemoveTagFromFiles,
    availableCategories: availableCategoriesFromHook
  } = useFileExplorer({
    files,
    availableFolders,
    availableCategories,
    currentFolder,
    currentCategory,
    onRefresh,
    onCategoryChange,
    onCreateFolder,
    onCreateCategory,
    onAddFilesToFolder,
    onDeleteFolder,
    onDeleteCategory,
    onRemoveFromFolder,
    onRenameFolder,
    onRenameCategory,
    creatorId
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Files for {creatorName}</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload
          </Button>
          {selectedFileIds.length > 0 && isCreatorView && (
            <Button variant="outline" onClick={handleAddToFolderClick}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Add to Folder
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Input
          type="search"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select onValueChange={(value) => setSelectedTypes(value === 'all' ? [] : [value])}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="application">Documents</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="View Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid View</SelectItem>
            <SelectItem value="list">List View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="flex space-x-4">
        <div className="w-64">
          <h3 className="text-lg font-semibold mb-2">Folders</h3>
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-2 space-y-1">
              <Button variant="ghost" className="w-full justify-start" onClick={() => { onFolderChange('all'); onCategoryChange(null); }}>
                All Files
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { onFolderChange('unsorted'); onCategoryChange(null); }}>
                Unsorted Uploads
              </Button>
              <Separator />
              {availableCategories.map(category => (
                <div key={category.id}>
                  <h4 className="text-sm font-semibold px-2 mt-2">{category.name}</h4>
                  {availableFolders
                    .filter(folder => folder.categoryId === category.id)
                    .map(folder => (
                      <Button
                        key={folder.id}
                        variant="ghost"
                        className="w-full justify-start pl-4"
                        onClick={() => { onFolderChange(folder.id); onCategoryChange(category.id); }}
                      >
                        {folder.name}
                      </Button>
                    ))}
                </div>
              ))}
            </div>
          </ScrollArea>
          {isCreatorView && (
            <Button variant="outline" className="w-full mt-2" onClick={() => setIsAddCategoryModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          )}
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="aspect-video">
                    <Skeleton className="h-full w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-32" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-xl font-semibold">No files found</h2>
              <p className="mt-2">
                {searchQuery
                  ? `No files match your search query "${searchQuery}".`
                  : currentFolder === 'all'
                    ? 'Upload some files to get started.'
                    : `This folder is empty. Upload some files or move existing files here.`}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredFiles.map(file => (
                <Card key={file.id} className={selectedFileIds.includes(file.id) ? 'border-2 border-primary' : ''}>
                  <CardContent className="aspect-video relative">
                    {file.type.startsWith('image') ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="object-cover h-full w-full rounded-md"
                      />
                    ) : file.type.startsWith('video') ? (
                      <>
                        {file.thumbnail_url ? (
                          <img
                            src={file.thumbnail_url}
                            alt={file.name}
                            className="object-cover h-full w-full rounded-md"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-md">
                            <p className="text-gray-500">No Thumbnail</p>
                          </div>
                        )}
                        <video
                          src={file.url}
                          className="hidden"
                        />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-md">
                        <p className="text-gray-500">{file.type}</p>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedFileIds.includes(file.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFileIds(prev => [...prev, file.id]);
                          } else {
                            setSelectedFileIds(prev => prev.filter(id => id !== file.id));
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm font-medium truncate">{file.name}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{file.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {isCreatorView && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditNote(file)}>
                            <StickyNote className="w-4 h-4 mr-2" />
                            Edit Note
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddTagToFile(file)}>
                            <Tag className="w-4 h-4 mr-2" />
                            Add Tag
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleFileDeleted(file.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  {isCreatorView && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map(file => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{file.type}</TableCell>
                    <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                    <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                    {isCreatorView && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditNote(file)}>
                              <StickyNote className="w-4 h-4 mr-2" />
                              Edit Note
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddTagToFile(file)}>
                              <Tag className="w-4 h-4 mr-2" />
                              Add Tag
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleFileDeleted(file.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      
      {/* Updated FileExplorerModals with actual data */}
      <FileExplorerModals
        onRefresh={onRefresh}
        onUploadComplete={onUploadComplete}
        onUploadStart={onUploadStart}
        creatorId={creatorId}
        currentFolder={currentFolder}
        currentCategory={currentCategory}
        availableCategories={availableCategories}
        availableFolders={availableFolders}
        fileExplorerState={{
          isUploadModalOpen: fileExplorerState.isUploadModalOpen,
          setIsUploadModalOpen: fileExplorerState.setIsUploadModalOpen,
          isAddToFolderModalOpen: fileExplorerState.isAddToFolderModalOpen,
          setIsAddToFolderModalOpen: fileExplorerState.setIsAddToFolderModalOpen,
          isCreateFolderModalOpen: fileExplorerState.isCreateFolderModalOpen,
          setIsCreateFolderModalOpen: fileExplorerState.setIsCreateFolderModalOpen,
          isAddCategoryModalOpen: fileExplorerState.isAddCategoryModalOpen,
          setIsAddCategoryModalOpen: fileExplorerState.setIsAddCategoryModalOpen,
          isDeleteFolderModalOpen: fileExplorerState.isDeleteFolderModalOpen,
          setIsDeleteFolderModalOpen: fileExplorerState.setIsDeleteFolderModalOpen,
          isDeleteCategoryModalOpen: fileExplorerState.isDeleteCategoryModalOpen,
          setIsDeleteCategoryModalOpen: fileExplorerState.setIsDeleteCategoryModalOpen,
          isFileNoteModalOpen: fileExplorerState.isFileNoteModalOpen,
          setIsFileNoteModalOpen: fileExplorerState.setIsFileNoteModalOpen,
          fileToEdit: fileExplorerState.fileToEdit,
          setFileToEdit: fileExplorerState.setFileToEdit,
          selectedFileIds: fileExplorerState.selectedFileIds,
          isAddTagModalOpen: fileExplorerState.isAddTagModalOpen,
          setIsAddTagModalOpen: fileExplorerState.setIsAddTagModalOpen,
          availableTags: fileExplorerState.availableTags,
          onAddTagToFiles: fileExplorerState.onAddTagToFiles,
          onRemoveTagFromFiles: fileExplorerState.onRemoveTagFromFiles,
          onTagCreate: fileExplorerState.onTagCreate
        }}
      />
    </div>
  );
};
