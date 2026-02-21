import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useSignUp } from "../../../features/auth/hooks/use-auth";
import { signUpSchema, type SignUpFormValues } from "../../../features/auth/schemas/auth.schemas";
import { environments } from "../../../config/environments";
import { useAuthStore } from "../../../store/authStore";

export const Register = () => {
  const navigate = useNavigate();
  const signUpMutation = useSignUp();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      date_of_birth: "",
    },
  });

  const onSubmit = useCallback(
    async (values: SignUpFormValues) => {
      try {
        const data = await signUpMutation.mutateAsync(values);
        login(data);
        navigate("/login", { replace: true });
      } catch {
        // error handled by useSignUp onError toast
      }
    },
    [signUpMutation, navigate],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-stone-700/50">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">{environments.APP_NAME}</h1>
          <p className="text-stone-400 text-center mb-8">Create your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-stone-300 mb-2">
                Username
              </label>
              <input id="username" type="text" autoComplete="username" placeholder="Your username" className="w-full px-4 py-3 bg-stone-900/50 border border-stone-600 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all" {...register("username")} />
              {errors.username && <p className="mt-1 text-sm text-amber-400">{errors.username.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-2">
                Email
              </label>
              <input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="w-full px-4 py-3 bg-stone-900/50 border border-stone-600 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all" {...register("email")} />
              {errors.email && <p className="mt-1 text-sm text-amber-400">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-300 mb-2">
                Password
              </label>
              <input id="password" type="password" autoComplete="new-password" placeholder="••••••••" className="w-full px-4 py-3 bg-stone-900/50 border border-stone-600 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all" {...register("password")} />
              {errors.password && <p className="mt-1 text-sm text-amber-400">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-stone-300 mb-2">
                Date of birth
              </label>
              <input id="date_of_birth" type="date" className="w-full px-4 py-3 bg-stone-900/50 border border-stone-600 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all" {...register("date_of_birth")} />
              {errors.date_of_birth && <p className="mt-1 text-sm text-amber-400">{errors.date_of_birth.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-stone-600 disabled:to-stone-600 disabled:cursor-not-allowed text-stone-900 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/25">
              {isSubmitting ? "Creating account…" : "Register"}
            </button>

            <p className="text-center text-stone-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
