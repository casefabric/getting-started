'use strict';

import { assertPlanItem } from "@cafienne/typescript-client";
import CaseTeam from "@cafienne/typescript-client/cmmn/team/caseteam";
import CaseTeamUser, { CaseOwner } from "@cafienne/typescript-client/cmmn/team/caseteamuser";
import CaseService from "@cafienne/typescript-client/service/case/caseservice";
import State from '@cafienne/typescript-client/cmmn/state';
import TestTenant from "./testtenant";
import CaseFileService from "@cafienne/typescript-client/service/case/casefileservice";
import TaskService from "@cafienne/typescript-client/service/task/taskservice";
import assertCaseFileContent from "@cafienne/typescript-client/test/caseassertions/file";

// global setup
const helloWorldDefinition = 'HelloWorld.xml';
const testTenant = new TestTenant();
const partner = testTenant.admin;
const employee = testTenant.employee;

describe('HelloWorldTest', async function () {
    const caseTeam = new CaseTeam([
        new CaseOwner(employee),
        new CaseTeamUser(partner),
    ]);

    this.beforeAll(async function () {
        await testTenant.create();
    });

    it('CreateAndCompleteCase', async function () {
        const startCase = { tenant: testTenant.name, definition: helloWorldDefinition, inputs:{}, caseTeam, debug: true };

        var caseInstance = await CaseService.startCase(employee, startCase);
        console.log(caseInstance);

        await assertPlanItem(employee, caseInstance.id, "Calculation", 0, State.Completed);

        await CaseFileService.createCaseFileItem(employee, caseInstance.id, "Greeting", { To: "User@example.com", Message: "Hello World!" });
        await assertCaseFileContent(employee, caseInstance.id, "Greeting", { To: "User@example.com", Message: "Hello World!" });

        const greetingPlanItem = (await TaskService.getCaseTasks(employee, caseInstance.id)).find(t => t.taskName == "Greet");
        await TaskService.completeTask(employee, greetingPlanItem.id);

        await assertPlanItem(employee, caseInstance.id, "HelloWorld", 0, State.Completed);
     });
});