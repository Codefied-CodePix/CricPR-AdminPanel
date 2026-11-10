import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "../../components/ui/card";
import { useToast } from "../../components/ui/toast";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/CircPr-logo.png";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { setTheme, theme } = useThemeStore();
  const { addToast } = useToast();
  const { loginAsync, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  // Use dark logo for dark mode, regular logo for light mode
  const logoSrc = theme === 'dark' ? '/logo_dark.png' : logo;

  // Redirect if already authenticated (only on mount, not after login)
  useEffect(() => {
    const checkAuth = () => {
      const { isAuthenticated: auth, token, tokenExpiry } = useAuthStore.getState();
      if (auth && token && tokenExpiry) {
        try {
          const expiryDate = new Date(tokenExpiry);
          const now = new Date();
          if (expiryDate > now) {
            navigate("/dashboard", { replace: true });
          }
        } catch {
          // Invalid expiry date, stay on login page
        }
      }
    };
    checkAuth();
  }, [navigate]); // Only run on mount

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem("theme-storage");
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        const theme = parsed.theme || parsed.state?.theme;
        if (theme) {
          setTheme(theme);
        } else {
          setTheme("light");
        }
      } catch {
        setTheme("light");
      }
    } else {
      setTheme("light");
    }
  }, [setTheme]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginAsync({
        email: data.email,
        password: data.password,
      });
      addToast({
        title: "Success",
        description: "Logged in successfully",
        variant: "success",
      });
      // Navigate after login - the store is already updated by loginAsync
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      addToast({
        title: "Error",
        description: (error instanceof Error && error.message) || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-login-top-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230E795D' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-xl bg-card/95 relative z-10">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto mb-2 flex items-center justify-center">
            <img
              src={logoSrc}
              alt="CricPR Logo"
              className="h-20 w-auto object-contain drop-shadow-lg"
            />
          </div>
          <div>
            <CardDescription className="text-base">
              Enter your credentials to access the admin panel
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@cricpr.com"
                className="h-11 border-2 focus:border-primary transition-colors"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 border-2 focus:border-primary transition-colors pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-primary-button-gradient hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
