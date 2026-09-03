import { Form, Head } from '@inertiajs/react';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

const inputStyles =
    'h-12 rounded-xl border-harbor/15 bg-white pr-4 pl-11 text-[15px] text-ember shadow-sm transition-all placeholder:text-ember-400/70 focus-visible:border-sienna/60 focus-visible:ring-sienna/25 focus-visible:ring-[3px]';

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-bold text-harbor"
                                >
                                    Full name
                                </Label>
                                <div className="relative">
                                    <UserRound className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-clay-600" />
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Jane Doe"
                                        className={inputStyles}
                                    />
                                </div>
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-bold text-harbor"
                                >
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-clay-600" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="email@example.com"
                                        className={inputStyles}
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-bold text-harbor"
                                >
                                    Password
                                </Label>
                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 z-10 size-4.5 -translate-y-1/2 text-clay-600" />
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Create a password"
                                        passwordrules={passwordRules}
                                        className={inputStyles}
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-sm font-bold text-harbor"
                                >
                                    Confirm password
                                </Label>
                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 z-10 size-4.5 -translate-y-1/2 text-clay-600" />
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm your password"
                                        passwordrules={passwordRules}
                                        className={inputStyles}
                                    />
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="h-12 w-full rounded-full bg-sienna text-[15px] font-bold text-white shadow-lg shadow-sienna/30 transition-all hover:-translate-y-px hover:bg-sienna-600"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                                <ArrowRight className="size-4.5" />
                            </Button>

                            <p className="flex items-start justify-center gap-1.5 text-center text-[13px] leading-relaxed text-ember-500">
                                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-moss-600" />
                                By creating an account you agree to our Terms
                                &amp; Privacy Policy.
                            </p>
                        </div>

                        <div className="text-center text-sm font-medium text-ember-500">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="font-bold text-sienna decoration-sienna/40 hover:text-sienna-600"
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Join ProjectLink',
    description: 'Create your account and start discovering projects.',
};
