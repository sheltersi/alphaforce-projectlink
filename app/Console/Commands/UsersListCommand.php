<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class UsersListCommand extends Command
{
    protected $signature = 'users:list
        {--role= : Filter by role name (e.g. participant, project_manager, technical_admin)}
        {--email= : Look up a single user by email}
        {--search= : Search by name or email (LIKE)}
        {--created : Include the created_at column}';

    protected $description = 'List users in the database along with their role(s).';

    public function handle(): int
    {
        $query = User::query()->with('roles');

        if ($email = $this->option('email')) {
            $query->where('email', $email);
        }

        if ($search = $this->option('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $this->option('role')) {
            $query->role($role);
        }

        $users = $query->orderBy('id')->get();

        if ($users->isEmpty()) {
            $this->components->warn('No users matched.');

            return self::SUCCESS;
        }

        $headers = ['id', 'name', 'email'];
        if ($this->option('created')) {
            $headers[] = 'created_at';
        }
        $headers[] = 'roles';

        $rows = $users->map(function (User $user) {
            $row = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ];

            if ($this->option('created')) {
                $row['created_at'] = $user->created_at?->toDateTimeString() ?? '';
            }

            $row['roles'] = $user->getRoleNames()->implode(', ') ?: '(none)';

            return $row;
        });

        $this->table($headers, $rows);

        $this->components->info($users->count().' user(s) shown.');

        return self::SUCCESS;
    }
}
