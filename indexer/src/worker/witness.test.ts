import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWitnessInput, subjectIdFromRequest } from './witness.js';
import type { PolicyDefinitionRecord } from './types.js';

test('subjectIdFromRequest uses request subject', () => {
  const subject = subjectIdFromRequest({
    id: '1',
    requestIdentifier: '1',
    parametersHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    issuer: '0x3000000000000000000000000000000000000003',
    subject: '0xAa000000000000000000000000000000000000Aa',
    beneficiary: '0x2000000000000000000000000000000000000002',
    assetIdentifier: '7',
    amount: '10',
    amountCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
    destinationCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
    payloadHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    expiryTimestamp: '0',
    documentationHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    privacyMode: 'NONE',
    privacyContextHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    status: 'REQUESTED',
  });

  assert.equal(subject, '0xaa000000000000000000000000000000000000aa');
});

test('buildWitnessInput enforces required checks', () => {
  const policyDefinition: PolicyDefinitionRecord = {
    schemaVersion: 1,
    source: 'test',
    createdAt: 1,
    updatedAt: 1,
    policyId: '1',
    policyHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    policyPreimage: '0x1234',
    attestorSetRoot: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    attestorThreshold: 2,
    validFromTimestamp: 0,
    validUntilTimestamp: 0,
    templateVersion: 'TEMPLATE_PAYROLL',
    requiredChecks: ['KYC_PASS', 'SANCTIONS_CLEAR'],
    freshnessWindows: { KYC_PASS: 3600, SANCTIONS_CLEAR: 3600 },
    domainSeparator: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  };

  assert.throws(() =>
    buildWitnessInput({
      request: {
        id: '1',
        requestIdentifier: '1',
        parametersHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
        issuer: '0x3000000000000000000000000000000000000003',
        subject: '0x4000000000000000000000000000000000000004',
        beneficiary: '0x2000000000000000000000000000000000000002',
        assetIdentifier: '7',
        amount: '10',
        amountCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
        destinationCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
        payloadHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        expiryTimestamp: '0',
        documentationHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
        privacyMode: 'NONE',
        privacyContextHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        status: 'REQUESTED',
      },
      policy: {
        id: '1',
        policyIdentifier: '1',
        policyHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        attestorSetRoot: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        attestorThreshold: '2',
        validFromTimestamp: '0',
        validUntilTimestamp: '0',
        allowNone: true,
        allowDestinationPrivate: true,
        allowAmountPrivate: true,
        allowFullPrivate: true,
        allowPerIssuanceOverride: false,
        allowConfigurationUpdates: true,
        privacySchemaVersion: 1,
        status: 'ACTIVE',
        isActive: true,
      },
      policyDefinition,
      checks: [
        {
          schemaVersion: 1,
          source: 'test',
          createdAt: 1,
          updatedAt: 1,
          subjectId: '0x4000000000000000000000000000000000000004',
          checkId: 'KYC_PASS',
          passed: true,
          observedAt: 1,
          digest: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
          payloadHash: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        },
      ],
      attestations: [],
      chainId: 99999,
      issuanceRegistryAddress: '0x1000000000000000000000000000000000000001',
      currentTimestamp: 1,
    }),
  );
});

test('buildWitnessInput encodes privacy mode for full private', () => {
  const policyDefinition: PolicyDefinitionRecord = {
    schemaVersion: 1,
    source: 'test',
    createdAt: 1,
    updatedAt: 1,
    policyId: '1',
    policyHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    policyPreimage: '0x1234',
    attestorSetRoot: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    attestorThreshold: 1,
    validFromTimestamp: 0,
    validUntilTimestamp: 0,
    templateVersion: 'TEMPLATE_PAYROLL',
    requiredChecks: ['KYC_PASS'],
    freshnessWindows: { KYC_PASS: 3600 },
    domainSeparator: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  };

  const witness = buildWitnessInput({
    request: {
      id: '1',
      requestIdentifier: '1',
      parametersHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      issuer: '0x3000000000000000000000000000000000000003',
      subject: '0x4000000000000000000000000000000000000004',
      beneficiary: '0x0000000000000000000000000000000000000000',
      assetIdentifier: '7',
      amount: '0',
      amountCommitment: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      destinationCommitment: '0xabababababababababababababababababababababababababababababababab',
      payloadHash: '0xcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd',
      expiryTimestamp: '0',
      documentationHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      privacyMode: 'FULL_PRIVATE',
      privacyContextHash: '0x9999999999999999999999999999999999999999999999999999999999999999',
      status: 'REQUESTED',
    },
    policy: {
      id: '1',
      policyIdentifier: '1',
      policyHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      attestorSetRoot: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      attestorThreshold: '1',
      validFromTimestamp: '0',
      validUntilTimestamp: '0',
      allowNone: true,
      allowDestinationPrivate: true,
      allowAmountPrivate: true,
      allowFullPrivate: true,
      allowPerIssuanceOverride: true,
      allowConfigurationUpdates: true,
      privacySchemaVersion: 1,
      status: 'ACTIVE',
      isActive: true,
    },
    policyDefinition,
    checks: [
      {
        schemaVersion: 1,
        source: 'test',
        createdAt: 1,
        updatedAt: 1,
        subjectId: '0x4000000000000000000000000000000000000004',
        checkId: 'KYC_PASS',
        passed: true,
        observedAt: 1,
        digest: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
        payloadHash: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      },
    ],
    attestations: [],
    chainId: 99999,
    issuanceRegistryAddress: '0x1000000000000000000000000000000000000001',
    currentTimestamp: 1,
  });

  assert.equal(witness.request.privacy_mode, 3);
  assert.equal(witness.request.subject, '0x4000000000000000000000000000000000000004');
});
