"use client";

import { motion } from "framer-motion";
import type { ApprovalRequest } from "@/types";

interface ApprovalCardProps {
  approval: ApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  onModify: () => void;
}

export function ApprovalCard({
  approval,
  onApprove,
  onReject,
  onModify,
}: ApprovalCardProps) {
  if (approval.status !== "pending") return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-lg bg-surface-elevated/30 px-4 py-4 sm:px-6 sm:py-5"
    >
      <div className="mb-5">
        <p className="text-[14px] font-medium text-text-primary leading-relaxed">
          {approval.title}
        </p>
        <p className="mt-2 text-[13px] text-text-secondary leading-relaxed">
          {approval.reason}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-text-muted">
          <span>{approval.requestingAgent}</span>
          <span className="text-claude-coral/70">{approval.estimatedImpact}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={onApprove}
          className="rounded-md bg-claude-coral/12 px-3 py-2 text-[12px] font-medium text-claude-coral transition-colors duration-150 hover:bg-claude-coral/18"
        >
          Approve
        </button>
        <button
          onClick={onModify}
          className="rounded-md px-3 py-2 text-[12px] text-text-secondary transition-colors duration-150 hover:bg-surface-muted/40"
        >
          Modify
        </button>
        <button
          onClick={onReject}
          className="rounded-md px-3 py-2 text-[12px] text-text-muted transition-colors duration-150 hover:bg-surface-muted/40 hover:text-text-secondary"
        >
          Reject
        </button>
      </div>
    </motion.div>
  );
}
