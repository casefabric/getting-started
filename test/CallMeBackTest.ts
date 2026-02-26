'use strict';

import { assertPlanItem, CaseOwner } from "@cafienne/typescript-client";
import CaseTeam from "@cafienne/typescript-client/cmmn/team/caseteam";
import CaseTeamUser from "@cafienne/typescript-client/cmmn/team/caseteamuser";
import MockServer from "@cafienne/typescript-client/mock/mockserver";
import PostMock from "@cafienne/typescript-client/mock/postmock";
import CasePlanService from "@cafienne/typescript-client/service/case/caseplanservice";
import CaseService from "@cafienne/typescript-client/service/case/caseservice";
import assertCaseFileContent from "@cafienne/typescript-client/test/caseassertions/file";
import State from '@cafienne/typescript-client/cmmn/state';
import { CreateMockServer } from "./CafienneSetup";
import TestTenant from "./testtenant";

// global setup
const callMeBackDefinition = 'CallmeBack.xml';


const testTenant = new TestTenant();
const tenant = testTenant.name;
const partner = testTenant.admin;
const employee = testTenant.employee;
const SuccessId = "Success";
const NotifyBackId = "Notify";
const ReturnsError500 = "Fail";

async function setupMockServer(mockServer: MockServer) {
    new PostMock(mockServer, '/cmmn-wrapper', call => {
        call.onJSONContent(async function (post: any)  {
            if (post.Task == SuccessId)
            {
                  call.res.status(200).end();
            } 
            else if (post.Task == NotifyBackId)
            {
                var caseInstanceId = post.CaseInstanceId;
                var event = await assertPlanItem(employee, caseInstanceId, 'NotifyDone');
                await CasePlanService.raiseEvent(employee, caseInstanceId, event.id);
        
                call.res.status(200).end();
            } 
            else if (post.Task == ReturnsError500)
            {
                call.fail(500, ReturnsError500);
            } 
        })
    });

    await mockServer.start();
}

describe('CallMeBackTest', async function () {
    var mockServer = CreateMockServer();
    const caseTeam = new CaseTeam([
        new CaseOwner(employee),
        new CaseTeamUser(partner),
    ]);
    

    this.beforeAll(async function () {
        await setupMockServer(mockServer);
        await testTenant.create();
    });
    this.afterAll(async function() {
        await mockServer.stop();
    });

     it('CallbackReturns200Ok', async function () {
        const startCase = { tenant, definition: callMeBackDefinition, inputs:{ "task": SuccessId}, caseTeam, debug: true };

        var caseInstance = await CaseService.startCase(employee, startCase);
        console.log(caseInstance);

        await assertPlanItem(employee, caseInstance.id, "CallMeBack", 0, State.Completed);
     });
     it('CallbackNotifiesCase', async function () {
        const startCase = { tenant, definition: callMeBackDefinition, inputs:{ "task": NotifyBackId}, caseTeam, debug: true };

        var caseInstance = await CaseService.startCase(employee, startCase);
        console.log(caseInstance);

        await assertPlanItem(employee, caseInstance.id, "NotifyDone", 0, State.Completed);
        await assertCaseFileContent(employee, caseInstance.id, "output/success", true);
     });
     it('CallbackReturns500ISE', async function () {
        const startCase = { tenant, definition: callMeBackDefinition, inputs:{ "task": ReturnsError500}, caseTeam, debug: true };

        var caseInstance = await CaseService.startCase(employee, startCase);
        console.log(caseInstance);

        await assertPlanItem(employee, caseInstance.id, "CallMeBack", 0, State.Failed);
        await assertCaseFileContent(employee, caseInstance.id, "output/success", false);
    });
});