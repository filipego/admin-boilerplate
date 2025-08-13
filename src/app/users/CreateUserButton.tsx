"use client";

import React from "react";
import UIButton from "@/components/common/UIButton";
import UserCreateModal from "./UserCreateModal";

export default function CreateUserButton() {
	const [open, setOpen] = React.useState(false);
	return (
		<>
			<UIButton uiSize="sm" onClick={() => setOpen(true)}>New User</UIButton>
			{open ? <UserCreateModal open={open} onOpenChange={setOpen} /> : null}
		</>
	);
}


