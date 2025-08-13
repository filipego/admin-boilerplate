"use client";

import ModalForm from "@/components/common/ModalForm";
import { TextField } from "@/components/common/form/Fields";
import { z } from "zod";
import { useState } from "react";
import { createUser } from "./actions";

const schema = z.object({
	email: z.string().email(),
	username: z.string().min(2),
	password: z.string().min(6),
	role: z.enum(["admin", "client"]).default("client"),
});

export default function UserCreateForm() {
	const [open, setOpen] = useState(true);
	return (
		<ModalForm
			open={open}
			onOpenChange={setOpen}
			title="New User"
			schema={schema}
			defaultValues={{ email: "", username: "", password: "", role: "client" }}
			onSubmit={async (values) => {
				await createUser(values);
			}}
		>
			<TextField name="email" label="Email" placeholder="user@example.com" />
			<TextField name="username" label="Username" placeholder="Username" />
			<TextField name="password" label="Password" placeholder="Password" />
		</ModalForm>
	);
}


