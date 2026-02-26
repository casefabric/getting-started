'use strict';

import { TenantOwner } from "@cafienne/typescript-client";
import PlatformService from "@cafienne/typescript-client/service/platform/platformservice";
import Tenant from "@cafienne/typescript-client/tenant/tenant";
import TenantUser from "@cafienne/typescript-client/tenant/tenantuser";
import User from "@cafienne/typescript-client/user";

const rolePartner = 'Partner';
const roleEmployee = 'Employee';
 
export default class TestTenant {
    name: string = 'Test-Tenant2';
    platformAdmin: User = new User('admin');

    admin = new TenantOwner('partner-pete', [rolePartner], 'Pete', 'pete@all.com');
    employee = new TenantUser('employee-eddy', [roleEmployee], 'Eddy', 'no email address');

    tenant: Tenant;

    constructor(name: string = 'Test-Tenant2', platformAdmin: User = new User('admin')) {
        this.name = name;
        this.platformAdmin = platformAdmin;
        this.tenant = new Tenant(this.name, [this.admin, this.employee]);
    }

    /**
     * Creates the tenant, and logs in for sender user and receiver user.
     */
    async create() {
        await this.platformAdmin.login();
        await PlatformService.createTenant(this.platformAdmin, this.tenant);
        await this.admin.login();
        await this.employee.login();
    }
}