import { Form, Head } from '@inertiajs/react';
import {
    ArrowRight,
    LockKeyhole,
    Mail,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
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
    invitationToken?: string | null;
};

const inputStyles =
    'h-12 rounded-xl border-harbor/15 bg-white pr-4 pl-11 text-[15px] text-ember shadow-sm transition-all placeholder:text-ember-400/70 focus-visible:border-sienna/60 focus-visible:ring-sienna/25 focus-visible:ring-[3px]';

export default function Register({ passwordRules, invitationToken }: Props) {
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
                        {invitationToken && (
                            <input
                                type="hidden"
                                name="invitation_token"
                                value={invitationToken}
                            />
                        )}
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="text-harbor text-sm font-bold"
                                >
                                    Full name
                                </Label>
                                <div className="relative">
                                    <UserRound className="text-clay-600 pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2" />
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
                                    className="text-harbor text-sm font-bold"
                                >
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="text-clay-600 pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2" />
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
                                    className="text-harbor text-sm font-bold"
                                >
                                    Password
                                </Label>
                                <div className="relative">
                                    <LockKeyhole className="text-clay-600 pointer-events-none absolute top-1/2 left-4 z-10 size-4.5 -translate-y-1/2" />
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
                                    className="text-harbor text-sm font-bold"
                                >
                                    Confirm password
                                </Label>
                                <div className="relative">
                                    <LockKeyhole className="text-clay-600 pointer-events-none absolute top-1/2 left-4 z-10 size-4.5 -translate-y-1/2" />
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
                                className="bg-sienna shadow-sienna/30 hover:bg-sienna-600 h-12 w-full rounded-full text-[15px] font-bold text-white shadow-lg transition-all hover:-translate-y-px"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                                <ArrowRight className="size-4.5" />
                            </Button>

                            <p className="text-ember-500 flex items-start justify-center gap-1.5 text-center text-[13px] leading-relaxed">
                                <ShieldCheck className="text-moss-600 mt-0.5 size-4 shrink-0" />
                                By creating an account you agree to our Terms
                                &amp; Privacy Policy.
                            </p>
                        </div>

                        <div className="text-ember-500 text-center text-sm font-medium">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="text-sienna decoration-sienna/40 hover:text-sienna-600 font-bold"
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
