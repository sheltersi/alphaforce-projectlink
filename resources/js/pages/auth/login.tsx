import { Form, Head } from '@inertiajs/react';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

const inputStyles =
    'h-12 rounded-xl border-harbor/15 bg-white pr-4 pl-11 text-[15px] text-ember shadow-sm transition-all placeholder:text-ember-400/70 focus-visible:border-sienna/60 focus-visible:ring-sienna/25 focus-visible:ring-[3px]';

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            {status && (
                <div className="mb-5 rounded-xl border border-moss/30 bg-moss/10 px-4 py-3 text-center text-sm font-semibold text-moss-600">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
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
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className={inputStyles}
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-bold text-harbor"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm font-bold text-sienna decoration-sienna/40 hover:text-sienna-600"
                                            tabIndex={5}
                                        >
                                            Forgot your password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 z-10 size-4.5 -translate-y-1/2 text-clay-600" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className={inputStyles}
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="size-5 rounded-md border-harbor/25 data-[state=checked]:border-sienna data-[state=checked]:bg-sienna"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-semibold text-ember-600"
                                >
                                    Remember me
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="h-12 w-full rounded-full bg-sienna text-[15px] font-bold text-white shadow-lg shadow-sienna/30 transition-all hover:-translate-y-px hover:bg-sienna-600"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                                <ArrowRight className="size-4.5" />
                            </Button>
                        </div>

                        <div className="text-center text-sm font-medium text-ember-500">
                            New to ProjectLink?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={5}
                                className="font-bold text-sienna decoration-sienna/40 hover:text-sienna-600"
                            >
                                Create your account
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Log in to pick up where you left off.',
};
