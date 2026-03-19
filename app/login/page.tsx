"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { useDialog } from "@/hooks/use-dialog";
import { Package, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Endereço de e-mail inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { alertDialog } = useDialog();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        alertDialog(
          "Falha no Login",
          "As credenciais inseridas estão incorrectas. Por favor, verifique o seu email e senha e tente novamente."
        );
      } else {
        notify.success("Login realizado com sucesso!");
        router.push("/");
        router.refresh();
      }
    } catch {
      alertDialog(
        "Erro de Conexão",
        "Ocorreu um erro ao comunicar com o servidor. Por favor, tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 lg:hidden mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">STOK</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-muted-foreground">
          Insira as suas credenciais para aceder à plataforma
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="admin@stok.com"
                      className="pl-10 h-11 bg-muted/40 border-border/60 focus:bg-background transition-colors"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium">Senha</FormLabel>
                  <button
                    type="button"
                    className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-muted/40 border-border/60 focus:bg-background transition-colors"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 font-semibold text-sm mt-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A verificar...
              </>
            ) : (
              "Entrar na Plataforma"
            )}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground">
            Acesso seguro com encriptação de ponta a ponta
          </span>
        </div>
      </div>
    </div>
  );
}
