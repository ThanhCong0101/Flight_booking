import assert = require("assert");
import { expect } from "chai";
import { it } from "node:test";
var sinon = require("sinon");

// var chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);

import { Payment } from "../models/entity/Payment";
const paymentService = require("../services/paymentService");

describe("updatePayment", () => {
  let findOneStub;

  beforeEach(() => {
    findOneStub = sinon.stub(Payment, "findOne");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should update payment successfully", async () => {

    const paymentDetail = { amount: 200 };

    // const result = await paymentService.updatePayment("123", paymentDetail);

    try {
      expect(findOneStub.calledOnceWith({ where: { payment_id: "123" } })).to.be.true;
      console.log("Test passed: findOne called with correct parameters");
    } catch (error) {
      console.error(
        "Test failed: findOne not called as expected",
        error.message
      );
      throw error;
    }
  });

  // it("should update payment successfully", async () => {
  //   const mockPayment = {
  //     payment_id: "123",
  //     amount: 100,
  //     save: saveStub,
  //   };
  //   findOneStub.resolves(mockPayment);

  //   const paymentDetail = { amount: 200 };
  //   const result = await paymentService.updatePayment("123", paymentDetail);

  //   try {
  //     expect(findOneStub.calledOnceWith({ where: { payment_id: "123" } })).to.be
  //       .true;
  //     console.log("Test passed: findOne called with correct parameters");
  //   } catch (error) {
  //     console.error(
  //       "Test failed: findOne not called as expected",
  //       error.message
  //     );
  //     throw error;
  //   }

  //   try {
  //     expect(saveStub.calledOnce).to.be.true;
  //     console.log("Test passed: save method called once");
  //   } catch (error) {
  //     console.error(
  //       "Test failed: save method not called as expected",
  //       error.message
  //     );
  //     throw error;
  //   }

  //   try {
  //     expect(result).to.deep.equal({ ...mockPayment, ...paymentDetail });
  //     console.log("Test passed: result matches expected output");
  //   } catch (error) {
  //     console.error(
  //       "Test failed: result does not match expected output",
  //       error.message
  //     );
  //     throw error;
  //   }
  // });

  // it("should throw an error when payment is not found", async () => {
  //   findOneStub.resolves(null);

  //   try {
  //     await paymentService.updatePayment("456", { amount: 300 });
  //     assert.fail("Expected error was not thrown");
  //   } catch (error) {
  //     expect(error.message).to.equal("Payment with id 456 not found");
  //   }
  // });

  // it("should handle database errors", async () => {
  //   const dbError = new Error("Database connection failed");
  //   findOneStub.rejects(dbError);

  //   try {
  //     await paymentService.updatePayment("789", { amount: 400 });
  //     assert.fail("Expected error was not thrown");
  //   } catch (error) {
  //     expect(error).to.equal(dbError);
  //   }
  // });

  // it("should update multiple fields of payment", async () => {
  //   const mockPayment = {
  //     payment_id: "321",
  //     amount: 500,
  //     status: "pending",
  //     save: saveStub,
  //   };
  //   findOneStub.resolves(mockPayment);

  //   const paymentDetail = { amount: 600, status: "completed" };
  //   const result = await paymentService.updatePayment("321", paymentDetail);

  //   expect(findOneStub.calledOnceWith({ where: { payment_id: "321" } })).to.be
  //     .true;
  //   expect(saveStub.calledOnce).to.be.true;
  //   expect(result).to.deep.equal({ ...mockPayment, ...paymentDetail });
  // });

  // it("should not update payment when no changes are provided", async () => {
  //   const mockPayment = {
  //     payment_id: "654",
  //     amount: 700,
  //     save: saveStub,
  //   };
  //   findOneStub.resolves(mockPayment);

  //   const result = await paymentService.updatePayment("654", {});

  //   expect(findOneStub.calledOnceWith({ where: { payment_id: "654" } })).to.be
  //     .true;
  //   expect(saveStub.calledOnce).to.be.true;
  //   expect(result).to.deep.equal(mockPayment);
  // });
});
