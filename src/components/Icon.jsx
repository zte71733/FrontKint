import {
  Footprints, BookOpen, Sparkles, Lightbulb, Coins, Trophy, Target, Medal,
  Star, Users, Briefcase, Lock, Gamepad2, TrendingUp, Settings, Sun, Moon,
  Menu, Check, ChevronRight, ChevronDown, ChevronUp,
  Heart, MessageCircle, Send, Clock, Award, BarChart3,
  Plus, X, Search, Bell, LogOut, Home, User, Edit, Trash2,
  Camera, Image, Eye, EyeOff, Mail, LockKeyhole, AlertCircle,
  CheckCircle, XCircle, Info, ExternalLink, Calendar, MapPin,
  Phone, Link as LinkIcon, Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Mic, MicOff, Video, VideoOff, CameraOff,
  Download, Upload, Cloud, Folder, File, FileText,
  Copy, Clipboard, List, Grid, Layout, RefreshCw, Loader2,
  AlertTriangle, HelpCircle, Circle, Square, Minus, Percent,
  DollarSign, CreditCard, Wallet, Receipt, Tag, ShoppingCart,
  Package, Truck, Gift, Flame, Wind, Droplets, Snowflake,
  Thermometer, Sunrise, Sunset, Timer, Hourglass, Watch,
  History, Undo2, Redo2, Reply, Paperclip, AtSign, Hash,
  Code, Terminal, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Filter, Zap,
  Globe, Palette, Shield, MessageSquare, Activity, Crown
} from 'lucide-react';

const iconMap = {
  Footprints, BookOpen, Sparkles, Lightbulb, Coins, Trophy, Target, Medal,
  Star, Users, Briefcase, Lock, Gamepad2, TrendingUp, Settings, Sun, Moon,
  Menu, Check, ChevronRight, ChevronDown, ChevronUp,
  Heart, MessageCircle, Send, Clock, Award, BarChart3,
  Plus, X, Search, Bell, LogOut, Home, User, Edit, Trash2,
  Camera, Image, Eye, EyeOff, Mail, LockKeyhole, AlertCircle,
  CheckCircle, XCircle, Info, ExternalLink, Calendar, MapPin,
  Phone, LinkIcon, Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Mic, MicOff, Video, VideoOff, CameraOff,
  Download, Upload, Cloud, Folder, File, FileText,
  Copy, Clipboard, List, Grid, Layout, RefreshCw, Loader2,
  AlertTriangle, HelpCircle, Circle, Square, Minus, Percent,
  DollarSign, CreditCard, Wallet, Receipt, Tag, ShoppingCart,
  Package, Truck, Gift, Flame, Wind, Droplets, Snowflake,
  Thermometer, Sunrise, Sunset, Timer, Hourglass, Watch,
  History, Undo2, Redo2, Reply, Paperclip, AtSign, Hash,
  Code, Terminal, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Filter, Zap,
  Globe, Palette, Shield, MessageSquare, Activity, Crown
};

export default function Icon({ name, size = 16, className = '', ...props }) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} {...props} />;
}
