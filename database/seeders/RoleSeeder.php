<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public const ROLES = [
        'technical_admin',
        'project_manager',
        'candidate',
        'participant',
    ];

    public function run(): void
    {
        foreach (self::ROLES as $role) {
            Role::firstOrCreate(
                ['name' => $role, 'guard_name' => 'web'],
            );
        }

        foreach (User::query()->lazyById(100) as $user) {
            $user->syncProjectParticipationRole();
        }

        // Clear permission cache after seeding
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
