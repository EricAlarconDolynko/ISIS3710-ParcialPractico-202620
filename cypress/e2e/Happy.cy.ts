const createPlanFixture2 = {
	foto: "https://example.com/plan.jpg",
	name: "Recorrido por la ciudad",
	direccion: "Carrera 7 # 72-41",
	precio: "50000",
	duracion: "3",
	descripcion: "Un recorrido guiado por los lugares más representativos de la ciudad.",
	recomendacion: "Usar zapatos cómodos y llevar agua.",
};

const apiUrl2 = (Cypress as unknown as { env: (name: string) => string }).env(
	"NEXT_PUBLIC_API_URL",
);


describe("Crear un plan", () => {
	beforeEach(() => {
		cy.intercept("POST", `${apiUrl2}/plans`, {
			statusCode: 201,
			body: { id: "plan-test-1", ...createPlanFixture2     },
		}).as("createPlan");

		cy.visit("/plans/create");
	});

	it("permite llenar y crear un plan exitosamente", () => {
		cy.get("#foto").type(createPlanFixture2.foto);
		cy.get("#name").type(createPlanFixture2.name);
		cy.get("#direccion").type(createPlanFixture2.direccion);
		cy.get("#precio").clear().type(createPlanFixture2.precio);
		cy.get("#duracion").clear().type(createPlanFixture2.duracion);
		cy.get("#descripcion").type(createPlanFixture2.descripcion);
		cy.get("#recomendacion").type(createPlanFixture2.recomendacion);

		cy.contains("button", "Crear plan").should("not.be.disabled").click();

		cy.wait("@createPlan").its("request.body").should("deep.include", {
			name: createPlanFixture2.name,
			description: createPlanFixture2.descripcion,
			estimatedPrice: Number(createPlanFixture2.precio),
			estimatedTime: Number(createPlanFixture2.duracion),
			address: createPlanFixture2.direccion,
			image: createPlanFixture2.foto,
		});
		cy.location("pathname").should("include", "/plans");
	});

	it("muestra un error cuando el precio es negativo", () => {
		cy.get("#precio").clear().type("-1").blur();

		cy.get("#precio").should(($input) => {
			expect(($input[0] as HTMLInputElement).validity.valid).to.equal(false);
		});
		cy.get("#precio").closest("div").should("contain.text", "precio");
	});
});

