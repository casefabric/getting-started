'use strict';

import { ServerSideProcessing, assertPlanItem } from "@cafienne/typescript-client";
import CaseTeam from "@cafienne/typescript-client/cmmn/team/caseteam";
import CaseTeamUser, { CaseOwner } from "@cafienne/typescript-client/cmmn/team/caseteamuser";
import CaseService from "@cafienne/typescript-client/service/case/caseservice";
import RepositoryService from "@cafienne/typescript-client/service/case/repositoryservice";
import State from '@cafienne/typescript-client/cmmn/state';
import TestTenant from "./testtenant";
import ConsentGroup from "@cafienne/typescript-client/service/consentgroup/consentgroup";
import ConsentGroupMember, { ConsentGroupOwner } from "@cafienne/typescript-client/service/consentgroup/consentgroupmember";
import ConsentGroupService from "@cafienne/typescript-client/service/consentgroup/consentgroupservice";
import CaseTeamGroup, { GroupRoleMapping } from "@cafienne/typescript-client/cmmn/team/caseteamgroup";
import CaseTeamTenantRole from "@cafienne/typescript-client/cmmn/team/caseteamtenantrole";


// global setup
const caseName = 'ConsentGroupTestCase.xml';
const advisorTenant = new TestTenant("Advisor");
const adminTenant = new TestTenant("Company");
const adminGroup = new ConsentGroup([new ConsentGroupOwner(adminTenant.admin.id, ["Partner"]), new ConsentGroupMember(adminTenant.employee.id, ["CGR1", "CGR2"])], "0");
const advisorGroup = new ConsentGroup([new ConsentGroupOwner(advisorTenant.admin.id, ["Partner"]), new ConsentGroupMember(advisorTenant.employee.id, ["CGR1", "CGR2"])], "1");

describe('ConsentGroupTest', async function () {
    const caseTeam = new CaseTeam(
        [new CaseOwner(advisorTenant.employee)], // users
        [new CaseTeamGroup(adminGroup, [new GroupRoleMapping("CGR1", "OneTasker")]), // group with mapping
         new CaseTeamGroup(advisorGroup, [new GroupRoleMapping("Partner", "Starter")])] // group with mapping
        ); // tenant role mapping

    this.beforeAll(async function () {
        await advisorTenant.create();
        await adminTenant.create();
        await ConsentGroupService.createGroup(adminTenant.admin, adminTenant.tenant, adminGroup, 200);
        await ConsentGroupService.getGroup(adminTenant.admin, adminGroup);
        await ConsentGroupService.createGroup(advisorTenant.admin, advisorTenant.tenant, advisorGroup, 200);
        await ConsentGroupService.getGroup(advisorTenant.admin, advisorGroup);
    });

    it('CreateAndCompleteCase', async function () {
        const startCase = { tenant: advisorTenant.name, definition: caseName, inputs:{}, caseTeam, debug: true };

        var caseInstance = await CaseService.startCase(advisorTenant.employee, startCase);
        console.log(caseInstance);

        await assertPlanItem(advisorTenant.employee, caseInstance.id, "ConsentGroupInCaseTeam", 0, State.Active);
     });
});