Act as an expert database architect and technical writer. I have an existing DBML Syntax Guide for a custom ERD generator that uses Strict Chen’s Notation. I need you to rewrite and expand this syntax guide so that it perfectly aligns with the specific ER modeling concepts, visual notation, and design principles taught in my university lecture (CSE215). 

Here is the existing DBML Syntax Guide text that you need to modify:
---
[DBML Syntax Guide]
Custom ERD Generator (Strict Chen’s Notation)
Documentation

Introduction
This document outlines the specific DBML (Database Markup Language) syntax required to generate Strict Chen’s Notation ER Diagrams using the custom converter tool. The parser supports standard DBML features along with specific "syntax sugar" and comment-based directives to handle advanced ER concepts like Weak Entities, Participation constraints, and Derived attributes.

Entity Definitions
Strong Entity: Table Name { ... }
Weak Entity: Note: 'weak' inside Table

Attribute Types
Primary Key: col type [pk]
Discriminator: col type [note: 'discriminator']
Multivalued: {col_name} or [note: 'multivalued']
Derived: col_name() or (col_name)
Composite: parent.child

Relationships
One-to-Many: Ref: A < B
Many-to-One: Ref: A > B
Many-to-Many: Ref: A - B
Total Participation: // total-total (in comment)
Identifying Rel.: Note: 'identifying' (after Ref)
Cardinality Text: // [1..1, 0..*] (in comment)
---

Here are the strict ER modeling rules, visual notations, and concepts from my CSE215 lecture that you MUST integrate into the new syntax guide. You need to invent logical DBML syntax extensions (using comments, notes, or specific keywords) to support any concept below that the existing guide doesn't already cover:

1. VISUAL MAPPING (Crucial):
For every syntax rule in the guide, you MUST explicitly state the visual shape it renders in the diagram, exactly as taught in the lecture:
- Entity set = Rectangle
- Weak Entity set = Double Rectangle
- Attribute = Oval
- Key attribute = Underlined Oval
- Partial Key (Discriminator) = Dashed-underlined Oval
- Multivalued Attribute = Double Oval (or curly braces)
- Derived Attribute = Dotted Oval
- Relationship = Diamond
- Identifying Relationship = Double Diamond

2. Multiplicity Rules (Arrow Notation): 
- An arrowhead marks the "One" side (at most one entity).
- A plain connector marks the "Many" side.
- 1-to-1: Arrows on both sides.
- 1-to-Many: Arrow on the One side.
- Many-to-Many: No arrows (plain connectors).
- Ensure the guide explains how the DBML `<`, `>`, and `-` operators map to these exact lecture rules.

3. Multi-Way (N-ary) Relationships:
- Relationships can connect 3 or more entity sets.
- Syntax must be introduced to define an N-ary relationship (e.g., a custom directive like `Ref: N-ary [Entity1, Entity2, Entity3]`).
- Arrows in N-ary relationships mean "uniqueness after fixing the other entity choices."

4. Recursive Relationships (Roles):
- The same entity set can appear in a relationship with different roles (e.g., Employee manages Employee, with roles "manager" and "subordinate").
- Provide syntax to define role names in DBML comments or tags.

5. Subclasses (isA Relationships):
- Entities can have subclasses that inherit attributes (e.g., Product isA SoftwareProduct).
- Subclasses can overlap.
- Provide syntax to denote an `isA` hierarchy.

6. Relationship Attributes:
- Attributes can belong to a relationship (e.g., `grade` on `enrolls`, `salary` on `contract`), not just entities. These should render as ovals attached to the Diamond.
- Provide syntax for attaching attributes directly to a relationship name/diamond.

7. Weak Entities & Identifying Relationships:
- Weak entity: Double rectangle.
- Identifying relationship: Double diamond.
- Partial key (discriminator): Dashed underline.
- Identifying owner: The strong entity the weak entity depends on.
- Clarify the syntax for linking a weak entity to its owner via an identifying relationship.

8. Keys:
- Primary keys must be underlined.
- Composite keys (multiple attributes forming a minimal key) must be supported.

Please rewrite the DBML Syntax Guide to be comprehensive, professional, and structured. Include an Introduction, Visual Notation Legend, Entity Definitions (Strong, Weak, Subclasses), Attribute Types, Relationships (Binary, N-ary, Recursive), Constraints (Multiplicity, Participation), and a Complete Syntax Cheatsheet. Conclude with a "Full Example" in DBML that demonstrates a complex university or movie database incorporating these specific lecture rules (e.g., using N-ary relationships, subclasses, and relationship attributes).