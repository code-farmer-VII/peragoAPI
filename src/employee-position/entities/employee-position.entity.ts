import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity({ name: 'employee_positions' })
export class EmployeePosition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => EmployeePosition, parent => parent.children, { nullable: true })
  @JoinColumn({ name: "parentId"})
  parent: EmployeePosition;

  @OneToMany(() => EmployeePosition, child => child.parent)
  children: EmployeePosition[];
}
